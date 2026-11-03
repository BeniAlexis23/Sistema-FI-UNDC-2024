import Notice from '../models/notice.model.js'
import Category from '../models/category.model.js';
import { toPlainText } from '../libs/sanitize.js';
import { limaDayStart } from '../libs/time.js';
import { publicNoticeFilter } from '../libs/noticeVisibility.js';
import { adminNoticeSort, buildAdminNoticeFilter, newestFirst } from '../libs/noticeQuery.js';
import { deriveContentFields, exceedsSummaryLimit } from '../libs/noticeContent.js';
import { collectMediaUrls, findMissingUploads, removeUnreferencedUploads } from '../libs/mediaRefs.js';
import {
    serializeAdminListItem, serializeAdminNotice, serializePublicNotice, serializePublicNoticeDetail
} from '../libs/noticeSerializer.js';
import { removeUploadedFile } from '../multer.js';

const MAX_FEATURED = 3;
const publicListFields = 'title description imageUrl imageAlt date publishAt featured byline readingMinutes category createdAt';
const adminListFields = `${publicListFields} hidden user updatedAt`;

const findPublicNotices = (filter, sort, limit) => {
    const query = Notice.find(filter).select(publicListFields).sort(sort).populate('category', 'name slug').lean();
    return limit ? query.limit(limit) : query;
};

/*obtener las Noticias visibles sin tener cuenta el usuario (no ocultas ni programadas a futuro).
  Sin parámetros se conserva el orden de inserción que espera el cliente anterior */

export const getNoticias = async (req, res) => {
    try {
        const { limit, category, featuredFirst, sort } = req.query;
        const filter = publicNoticeFilter();

        if (category) {
            const categoryFound = await Category.findOne({ slug: category }).select('_id').lean();
            if (!categoryFound) return res.json([]);
            filter.category = categoryFound._id;
        }

        let noticias;
        if (!(limit || category || featuredFirst || sort)) {
            noticias = await findPublicNotices(filter, { _id: 1 });
        } else if (featuredFirst) {
            const featured = await findPublicNotices({ ...filter, featured: true }, newestFirst, Math.min(MAX_FEATURED, limit ?? MAX_FEATURED));
            const remaining = limit ? limit - featured.length : undefined;
            const rest = remaining === 0
                ? []
                : await findPublicNotices({ ...filter, _id: { $nin: featured.map((notice) => notice._id) } }, newestFirst, remaining);
            noticias = [...featured, ...rest];
        } else {
            noticias = await findPublicNotices(filter, newestFirst, limit);
        }

        const now = new Date();
        res.json(noticias.map((notice) => serializePublicNotice(notice, now)));
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

export const getNoticia = async (req, res) => {
    try {
        const noticia = await Notice.findOne({ _id: req.params.id, ...publicNoticeFilter() })
            .select('-user -hidden -mediaRefs -__v')
            .populate('category', 'name slug')
            .lean();
        if (!noticia) return res.status(404).json({ message: 'Notice not found' });
        res.json(serializePublicNoticeDetail(noticia));
    } catch (error) {
        return res.status(404).json({ message: 'Notice not found' });
    }
}

/*funciones para usuario autenticado */

const ownedNoticeFilter = (req) => (
    req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id }
);

export const getNotices = async (req, res) => {
    try {
        const { sort, page, limit } = req.query;
        const now = new Date();
        const filter = buildAdminNoticeFilter(req.user, req.query, now);
        const query = Notice.find(filter).select(adminListFields)
            .populate('user', 'username').populate('category', 'name slug').lean();

        // Sin parámetros: arreglo completo en orden de inserción, como esperaba el panel anterior
        if (Object.keys(req.query).length === 0) {
            const notices = await query.sort({ _id: 1 });
            return res.json(notices.map((notice) => serializeAdminListItem(notice, now)));
        }

        const pageNumber = page ?? 1;
        const pageSize = limit ?? 12;
        query.sort(adminNoticeSort(sort)).skip((pageNumber - 1) * pageSize).limit(pageSize);
        if (sort === 'title_asc') query.collation({ locale: 'es', strength: 1 });

        const [total, notices] = await Promise.all([Notice.countDocuments(filter), query]);
        res.json({
            items: notices.map((notice) => serializeAdminListItem(notice, now)),
            total,
            page: pageNumber,
            limit: pageSize
        });
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

export const getNoticeStats = async (req, res) => {
    try {
        const now = new Date();
        const [total, published, hidden, scheduled] = await Promise.all(
            [undefined, 'published', 'hidden', 'scheduled'].map(
                (status) => Notice.countDocuments(buildAdminNoticeFilter(req.user, { status }, now))
            )
        );
        res.json({ total, published, hidden, scheduled });
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

/* En multipart una cadena vacía significa «quitar el valor» */
const applyOptionalFields = (notice, body) => {
    if (body.hidden !== undefined) notice.hidden = body.hidden;
    if (body.featured !== undefined) notice.featured = body.featured;
    if (body.publishAt !== undefined) notice.publishAt = body.publishAt || undefined;
    if (body.category !== undefined) notice.category = body.category || undefined;
    if (body.byline !== undefined) notice.byline = body.byline || undefined;
    if (body.imageAlt !== undefined) notice.imageAlt = body.imageAlt || undefined;
};

const categoryExists = async (categoryId) => !categoryId || Boolean(await Category.exists({ _id: categoryId }));

const SUMMARY_TOO_LONG = ['Summary is too long (max 300 characters)'];

export const createNotice = async (req, res) => {
    // la subida ya está en disco: cualquier rechazo debe borrarla
    const reject = async (status, body) => {
        await removeUploadedFile(req.file).catch(() => {});
        return res.status(status).json(body);
    };

    try {
        const { title, date, publishAt, content } = req.body;

        let description;
        let derived;
        if (content !== undefined) {
            derived = deriveContentFields(content);
            description = toPlainText(req.body.description) || derived.summary || title;
            if (exceedsSummaryLimit(description)) return reject(400, SUMMARY_TOO_LONG);
        } else {
            description = toPlainText(req.body.description);
            if (!description) return reject(400, ['Description cannot be empty after sanitization']);
        }
        if (!await categoryExists(req.body.category)) return reject(400, ['Category not found']);

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || null);
        const mediaRefs = collectMediaUrls(imageUrl, content);
        const referencedUploads = req.file ? mediaRefs.filter((url) => url !== imageUrl) : mediaRefs;
        if ((await findMissingUploads(referencedUploads)).length) return reject(400, ['Image not found']);

        const newNotice = new Notice({
            title,
            description,
            imageUrl,
            date: date ?? (publishAt ? limaDayStart(publishAt) : undefined),
            mediaRefs,
            user: req.user.id
        });
        if (content !== undefined) {
            newNotice.content = content;
            newNotice.readingMinutes = derived.readingMinutes;
        }
        applyOptionalFields(newNotice, req.body);

        const savedNotice = await newNotice.save();
        res.json(savedNotice);
    } catch (error) {
        await removeUploadedFile(req.file).catch(() => {});
        return res.status(500).json({ error: "Something went wrong" });
    }
};

export const getNotice = async (req, res) => {
    try {
        const notice = await Notice.findOne(ownedNoticeFilter(req))
            .populate('user', 'username email role')
            .populate('category', 'name slug')
            .lean();
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json(serializeAdminNotice(notice));
    } catch (error) {
        return res.status(404).json({ message: 'Notice not found' });
    }
}

export const deleteNotice = async (req, res) => {
    try {
        const filter = req.user.role === 'admin'
            ? { _id: req.params.id }
            : { _id: req.params.id, user: req.user.id };
        const notice = await Notice.findOneAndDelete(filter);
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        await removeUnreferencedUploads(collectMediaUrls(notice.imageUrl, notice.content), notice._id);
        return res.sendStatus(204);
    } catch (error) {
        return res.status(404).json({ message: 'Notice not found' });
    }
}

export const updateNotice = async (req, res) => {
    const reject = async (status, body) => {
        await removeUploadedFile(req.file).catch(() => {});
        return res.status(status).json(body);
    };

    try {
        const filter = req.user.role === 'admin'
            ? { _id: req.params.id }
            : { _id: req.params.id, user: req.user.id };
        const notice = await Notice.findOne(filter);
        if (!notice) return reject(404, { message: 'Notice not found' });
        if (req.body.baseUpdatedAt && new Date(req.body.baseUpdatedAt).getTime() !== notice.updatedAt.getTime()) {
            return reject(409, { message: 'Notice was modified by someone else', code: 'NOTICE_CONFLICT' });
        }
        if (!await categoryExists(req.body.category)) return reject(400, ['Category not found']);

        const previousRefs = collectMediaUrls(notice.imageUrl, notice.content);
        const { content } = req.body;

        if (req.body.title !== undefined) notice.title = req.body.title;
        if (content !== undefined) {
            const derived = deriveContentFields(content);
            const provided = req.body.description !== undefined ? toPlainText(req.body.description) : undefined;
            // sin resumen enviado se conserva el actual si es corto; el cuerpo legado (largo) se reemplaza por uno derivado
            let description = provided !== undefined ? provided : notice.description;
            if (!description || (provided === undefined && exceedsSummaryLimit(description))) {
                description = derived.summary || notice.title;
            }
            if (exceedsSummaryLimit(description)) return reject(400, SUMMARY_TOO_LONG);
            notice.description = description;
            notice.content = content;
            notice.readingMinutes = derived.readingMinutes;
        } else if (req.body.description !== undefined) {
            const description = toPlainText(req.body.description);
            if (!description) return reject(400, ['Description cannot be empty after sanitization']);
            notice.description = description;
        }
        if (req.body.date !== undefined) notice.date = req.body.date;
        else if (req.body.publishAt) notice.date = limaDayStart(req.body.publishAt);
        applyOptionalFields(notice, req.body);

        if (req.file) notice.imageUrl = `/uploads/${req.file.filename}`;
        else if (req.body.imageUrl !== undefined) notice.imageUrl = req.body.imageUrl || null;

        const nextRefs = collectMediaUrls(notice.imageUrl, notice.content);
        const added = nextRefs.filter((url) => !previousRefs.includes(url) && !(req.file && url === notice.imageUrl));
        if ((await findMissingUploads(added)).length) return reject(400, ['Image not found']);
        notice.mediaRefs = nextRefs;

        const updatedNotice = await notice.save();
        await removeUnreferencedUploads(previousRefs.filter((url) => !nextRefs.includes(url)), notice._id);
        res.json(updatedNotice);
    } catch (error) {
        await removeUploadedFile(req.file).catch(() => {});
        return res.status(500).json({ error: "Something went wrong" });
    }
};

/* Ocultar o destacar desde la lista; actualiza `updatedAt`, así un formulario abierto antes no lo revierte */
export const updateNoticeVisibility = async (req, res) => {
    try {
        const notice = await Notice.findOne(ownedNoticeFilter(req));
        if (!notice) return res.status(404).json({ message: 'Notice not found' });

        if (req.body.hidden !== undefined) notice.hidden = req.body.hidden;
        if (req.body.featured !== undefined) notice.featured = req.body.featured;
        await notice.save();
        await notice.populate([{ path: 'user', select: 'username' }, { path: 'category', select: 'name slug' }]);
        res.json(serializeAdminListItem(notice.toObject()));
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" });
    }
};
