import EventSeries from '../models/eventSeries.model.js';
import EventEdition from '../models/eventEdition.model.js';
import Notice from '../models/notice.model.js';
import {
    serializeAdminEdition, serializeAdminSeries, serializePublicEditionWithNotices, serializePublicSeries
} from '../libs/eventSerializer.js';
import { findMissingUploads, removeUnreferencedUploads } from '../libs/mediaRefs.js';
import { publicNoticeFilter } from '../libs/noticeVisibility.js';
import { toRoman } from '../libs/roman.js';
import { toPlainText } from '../libs/sanitize.js';
import { truncate } from '../libs/text.js';
import { MAX_SUMMARY_CHARS } from '../schemas/events.schema.js';

const seriesOrder = { orden: 1, nombre: 1, _id: 1 };
const newestEditionFirst = { numero: -1, _id: -1 };
const visibleEdition = { hidden: { $ne: true } };
const linkedNoticeFields = 'title imageUrl imageAlt date';

const SERIES_VALUE_FIELDS = ['slug', 'nombre', 'sigla', 'urlPermanente', 'descripcion', 'logoAlt', 'orden', 'activo'];
const SERIES_CLEARABLE_FIELDS = ['logo', 'color'];
const EDITION_VALUE_FIELDS = ['serie', 'numero', 'titulo', 'sede', 'portadaAlt', 'hidden', 'destacada'];
const EDITION_CLEARABLE_FIELDS = ['semestre', 'fechaInicio', 'fechaFin', 'url', 'portada'];

const seriesImages = (series) => [series.logo].filter(Boolean);
const editionImages = (edition) => [edition.portada].filter(Boolean);
const idList = (values) => (values ?? []).map((value) => String(value?._id ?? value));

const applyFields = (document, body, valueFields, clearableFields) => {
    valueFields.forEach((field) => {
        if (body[field] !== undefined) document[field] = body[field];
    });
    clearableFields.forEach((field) => {
        if (body[field] !== undefined) document[field] = body[field] || undefined;
    });
};

/* El numeral se calcula del número salvo que el panel escriba otro; si el número cambia y el numeral era el automático, se recalcula */
const applyEditionFields = (edition, body) => {
    const hadAutomaticNumeral = !edition.numeral || edition.numeral === toRoman(edition.numero);
    applyFields(edition, body, EDITION_VALUE_FIELDS, EDITION_CLEARABLE_FIELDS);

    if (body.numeral) edition.numeral = body.numeral;
    else if (body.numeral === '' || !edition.numeral || (body.numero !== undefined && hadAutomaticNumeral)) {
        edition.numeral = toRoman(edition.numero);
    }
    if (body.resumen !== undefined) edition.resumen = truncate(toPlainText(body.resumen), MAX_SUMMARY_CHARS) || undefined;
    if (body.noticias !== undefined) {
        const unique = [...new Set(body.noticias.map((id) => id.toLowerCase()))];
        edition.noticias = unique.length ? unique : undefined;
    }
};

/* Las reglas entre campos se revisan sobre la edición ya combinada. La serie, las imágenes y las noticias
   solo se comprueban si cambiaron, para poder seguir editando una edición con datos que ya no existen */
const findEditionProblem = async (edition, { addedImages, addedNotices }) => {
    if (edition.fechaFin && !edition.fechaInicio) return 'The end needs a start date';
    if (edition.fechaInicio && edition.fechaFin && edition.fechaFin < edition.fechaInicio) return 'The end cannot be before the start';
    if (edition.isModified('serie') && !await EventSeries.exists({ _id: edition.serie })) return 'Event series not found';
    if ((await findMissingUploads(addedImages)).length) return 'Image not found';
    if (addedNotices.length && await Notice.countDocuments({ _id: { $in: addedNotices } }) !== addedNotices.length) return 'Notice not found';
    return null;
};

const duplicateNumberConflict = async (edition) => {
    if (!edition.isNew && !edition.isModified('numero') && !edition.isModified('serie')) return false;
    return Boolean(await EventEdition.exists({ serie: edition.serie, numero: edition.numero, _id: { $ne: edition._id } }));
};

/* A lo más una edición destacada por serie. La base de pruebas y la de producción no son réplicas (sin transacciones):
   primero se quita la marca a las demás y luego se pone en esta. Si dos pedidos se cruzan, el índice parcial único
   rechaza el segundo (409) en vez de dejar dos destacadas. */
const clearOtherDestacadas = (serie, editionId) => EventEdition.updateMany(
    { serie, _id: { $ne: editionId }, destacada: true },
    { $set: { destacada: false } }
);

const adminEditionQuery = (filter) => EventEdition.find(filter)
    .sort({ serie: 1, ...newestEditionFirst })
    .populate('serie', 'slug sigla nombre')
    .populate('noticias', 'title')
    .lean();

const adminEditionView = async (editionId) => {
    const [edition] = await adminEditionQuery({ _id: editionId });
    return serializeAdminEdition(edition);
};

const seriesNotFound = (res) => res.status(404).json({ message: 'Event series not found' });
const editionNotFound = (res) => res.status(404).json({ message: 'Edition not found' });

/* ---------- Público ---------- */

/* Series activas con su edición vigente (para el menú, la portada y /eventos) */
export const getEventos = async (req, res) => {
    const now = new Date();
    const series = await EventSeries.find({ activo: true }).sort(seriesOrder).lean();
    const editions = series.length
        ? await EventEdition.find({ serie: { $in: series.map((item) => item._id) }, ...visibleEdition })
            .select('-noticias').lean()
        : [];

    const bySeries = new Map(series.map((item) => [String(item._id), []]));
    editions.forEach((edition) => bySeries.get(String(edition.serie))?.push(edition));

    return res.json(series.map((item) => serializePublicSeries(item, bySeries.get(String(item._id)), now)));
};

/* Una serie con todas sus ediciones visibles (la más reciente primero) y sus noticias públicas */
export const getEvento = async (req, res) => {
    const now = new Date();
    const series = await EventSeries.findOne({ slug: req.params.slug, activo: true }).lean();
    if (!series) return res.status(404).json({ message: 'Event not found' });

    const editions = await EventEdition.find({ serie: series._id, ...visibleEdition })
        .sort(newestEditionFirst)
        .populate({ path: 'noticias', match: publicNoticeFilter(now), select: linkedNoticeFields })
        .lean();

    return res.json({
        ...serializePublicSeries(series, editions, now),
        ediciones: editions.map((edition) => serializePublicEditionWithNotices(edition, now))
    });
};

/* ---------- Panel: series ---------- */

const countEditions = async (seriesIds) => {
    const counts = await EventEdition.aggregate([
        { $match: { serie: { $in: seriesIds } } },
        { $group: { _id: '$serie', total: { $sum: 1 } } }
    ]);
    return new Map(counts.map((item) => [String(item._id), item.total]));
};

const adminSeriesView = async (series) => {
    const counts = await countEditions([series._id]);
    return serializeAdminSeries(series, counts.get(String(series._id)) ?? 0);
};

const slugTaken = (res) => res.status(409).json({ message: 'There is already a series with that slug', code: 'SLUG_TAKEN' });

export const getSeriesList = async (req, res) => {
    const series = await EventSeries.find().sort(seriesOrder).lean();
    const counts = await countEditions(series.map((item) => item._id));
    return res.json(series.map((item) => serializeAdminSeries(item, counts.get(String(item._id)) ?? 0)));
};

export const getSeries = async (req, res) => {
    const series = await EventSeries.findById(req.params.id).lean();
    if (!series) return seriesNotFound(res);
    return res.json(await adminSeriesView(series));
};

export const createSeries = async (req, res) => {
    const series = new EventSeries({ createdBy: req.user.id });
    applyFields(series, req.body, SERIES_VALUE_FIELDS, SERIES_CLEARABLE_FIELDS);

    if (await EventSeries.exists({ slug: series.slug })) return slugTaken(res);
    if ((await findMissingUploads(seriesImages(series))).length) return res.status(400).json(['Image not found']);

    await series.save();
    return res.status(201).json(await adminSeriesView(series.toObject()));
};

export const updateSeries = async (req, res) => {
    const series = await EventSeries.findById(req.params.id);
    if (!series) return seriesNotFound(res);

    const previousImages = seriesImages(series);
    applyFields(series, req.body, SERIES_VALUE_FIELDS, SERIES_CLEARABLE_FIELDS);
    const nextImages = seriesImages(series);

    if (series.isModified('slug') && await EventSeries.exists({ slug: series.slug, _id: { $ne: series._id } })) return slugTaken(res);
    if ((await findMissingUploads(nextImages.filter((url) => !previousImages.includes(url)))).length) {
        return res.status(400).json(['Image not found']);
    }

    await series.save();
    await removeUnreferencedUploads(previousImages.filter((url) => !nextImages.includes(url)), { excludeSeriesId: series._id });
    return res.json(await adminSeriesView(series.toObject()));
};

/* Una serie con ediciones no se borra: primero hay que borrar sus ediciones, o bien desactivarla */
export const deleteSeries = async (req, res) => {
    const series = await EventSeries.findById(req.params.id).lean();
    if (!series) return seriesNotFound(res);

    if (await EventEdition.exists({ serie: series._id })) {
        return res.status(409).json({ message: 'The series still has editions', code: 'SERIES_HAS_EDITIONS' });
    }

    await EventSeries.deleteOne({ _id: series._id });
    await removeUnreferencedUploads(seriesImages(series), { excludeSeriesId: series._id });
    return res.sendStatus(204);
};

/* ---------- Panel: ediciones ---------- */

export const getEditions = async (req, res) => {
    const filter = req.query.serie ? { serie: req.query.serie } : {};
    const now = new Date();
    const editions = await adminEditionQuery(filter);
    return res.json(editions.map((edition) => serializeAdminEdition(edition, now)));
};

export const getEdition = async (req, res) => {
    if (!await EventEdition.exists({ _id: req.params.id })) return editionNotFound(res);
    return res.json(await adminEditionView(req.params.id));
};

/* Valida y guarda; si hay un problema ya respondió y devuelve false */
const saveEdition = async (edition, res, { previousImages = [], previousNotices = [] } = {}) => {
    const nextImages = editionImages(edition);
    const problem = await findEditionProblem(edition, {
        addedImages: nextImages.filter((url) => !previousImages.includes(url)),
        addedNotices: idList(edition.noticias).filter((id) => !previousNotices.includes(id))
    });
    if (problem) {
        res.status(400).json([problem]);
        return false;
    }
    if (await duplicateNumberConflict(edition)) {
        res.status(409).json({ message: 'That series already has an edition with that number', code: 'EDITION_NUMBER_TAKEN' });
        return false;
    }

    if (edition.destacada && (edition.isNew || edition.isModified('destacada') || edition.isModified('serie'))) {
        await clearOtherDestacadas(edition.serie, edition._id);
    }
    await edition.save();
    return true;
};

export const createEdition = async (req, res) => {
    const edition = new EventEdition({ createdBy: req.user.id });
    applyEditionFields(edition, req.body);

    if (!await saveEdition(edition, res)) return undefined;
    return res.status(201).json(await adminEditionView(edition._id));
};

export const updateEdition = async (req, res) => {
    const edition = await EventEdition.findById(req.params.id);
    if (!edition) return editionNotFound(res);

    const previousImages = editionImages(edition);
    const previousNotices = idList(edition.noticias);
    applyEditionFields(edition, req.body);

    if (!await saveEdition(edition, res, { previousImages, previousNotices })) return undefined;

    const nextImages = editionImages(edition);
    await removeUnreferencedUploads(previousImages.filter((url) => !nextImages.includes(url)), { excludeEditionId: edition._id });
    return res.json(await adminEditionView(edition._id));
};

export const deleteEdition = async (req, res) => {
    const edition = await EventEdition.findByIdAndDelete(req.params.id).lean();
    if (!edition) return editionNotFound(res);

    await removeUnreferencedUploads(editionImages(edition), { excludeEditionId: edition._id });
    return res.sendStatus(204);
};

/* Marca (o desmarca) la edición vigente de su serie. Responde con todas las ediciones de esa serie
   para que el panel actualice también la que perdió la marca */
export const setEditionDestacada = async (req, res) => {
    const edition = await EventEdition.findById(req.params.id).select('serie').lean();
    if (!edition) return editionNotFound(res);

    const destacada = req.body.destacada ?? true;
    if (destacada) await clearOtherDestacadas(edition.serie, edition._id);
    await EventEdition.updateOne({ _id: edition._id, serie: edition.serie }, { $set: { destacada } });

    const now = new Date();
    const editions = await adminEditionQuery({ serie: edition.serie });
    return res.json(editions.map((item) => serializeAdminEdition(item, now)));
};

export const setEditionVisibility = async (req, res) => {
    const result = await EventEdition.updateOne({ _id: req.params.id }, { $set: { hidden: req.body.hidden } });
    if (!result.matchedCount) return editionNotFound(res);
    return res.json(await adminEditionView(req.params.id));
};
