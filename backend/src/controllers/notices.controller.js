import Notice from '../models/notice.model.js'
import { sanitizeRichText } from '../libs/sanitize.js';
import { removeUploadByUrl, removeUploadedFile } from '../multer.js';

/*obtener todas las Noticias sin tener cuenta el usuario */

export const getNoticias = async (req, res) => {
    try {
        const noticias = await Notice.find();
        res.json(noticias);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

export const getNoticia = async (req, res) => {
    try {
        const noticia = await Notice.findById(req.params.id);
        if (!noticia) return res.status(404).json({ message: 'Notice not found' });
        res.json(noticia);
    } catch (error) {
        return res.status(404).json({ message: 'Notice not found' });
    }
}

/*funciones para usuario autenticado */

export const getNotices = async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
        const notices = await Notice.find(filter).populate('user', 'username email role');
        res.json(notices);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

export const createNotice = async (req, res) => {
    try {
        const { title, date } = req.body;
        const description = sanitizeRichText(req.body.description);
        if (!description) {
            await removeUploadedFile(req.file).catch(() => {});
            return res.status(400).json(['Description cannot be empty after sanitization']);
        }
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const newNotice = new Notice({
            title,
            description,
            imageUrl,
            date,
            user: req.user.id
        });

        const savedNotice = await newNotice.save();
        res.json(savedNotice);
    } catch (error) {
        await removeUploadedFile(req.file).catch(() => {});
        return res.status(500).json({ error: "Something went wrong" });
    }
};

export const getNotice = async (req, res) => {
    try {
        const filter = req.user.role === 'admin'
            ? { _id: req.params.id }
            : { _id: req.params.id, user: req.user.id };
        const notice = await Notice.findOne(filter).populate('user', 'username email role');
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json(notice);
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
        await removeUploadByUrl(notice.imageUrl).catch((cleanupError) => {
            console.error('Unable to remove notice image', { name: cleanupError.name });
        });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(404).json({ message: 'Notice not found' });
    }
}

export const updateNotice = async (req, res) => {
    try {
        const filter = req.user.role === 'admin'
            ? { _id: req.params.id }
            : { _id: req.params.id, user: req.user.id };
        const notice = await Notice.findOne(filter);
        if (!notice) {
            await removeUploadedFile(req.file).catch(() => {});
            return res.status(404).json({ message: 'Notice not found' });
        }

        const oldImageUrl = notice.imageUrl;
        if (req.body.title !== undefined) notice.title = req.body.title;
        if (req.body.description !== undefined) {
            const description = sanitizeRichText(req.body.description);
            if (!description) {
                await removeUploadedFile(req.file).catch(() => {});
                return res.status(400).json(['Description cannot be empty after sanitization']);
            }
            notice.description = description;
        }
        if (req.body.date !== undefined) notice.date = req.body.date;
        if (req.file) notice.imageUrl = `/uploads/${req.file.filename}`;

        const updatedNotice = await notice.save();
        if (req.file && oldImageUrl !== updatedNotice.imageUrl) {
            await removeUploadByUrl(oldImageUrl).catch((cleanupError) => {
                console.error('Unable to remove replaced notice image', { name: cleanupError.name });
            });
        }
        res.json(updatedNotice);
    } catch (error) {
        await removeUploadedFile(req.file).catch(() => {});
        return res.status(500).json({ error: "Something went wrong" });
    }
};
