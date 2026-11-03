import HeroSlide from '../models/heroSlide.model.js';
import Notice from '../models/notice.model.js';
import { getHeroSettings, saveHeroSettings } from '../libs/heroSettings.js';
import { publicSlideFilter } from '../libs/heroVisibility.js';
import { serializeAdminSlide, serializeNoticeSlide, serializePublicSlide } from '../libs/heroSerializer.js';
import { findMissingUploads, removeUnreferencedUploads } from '../libs/mediaRefs.js';
import { newestFirst } from '../libs/noticeQuery.js';
import { publicNoticeFilter } from '../libs/noticeVisibility.js';
import { MAX_SLIDES } from '../schemas/hero.schema.js';

const MAX_FEATURED_SLIDES = 3;
const inOrder = { order: 1, createdAt: 1, _id: 1 };

const VALUE_FIELDS = ['image', 'alt', 'title', 'subtitle', 'ctaLabel', 'focusX', 'focusY', 'active'];
/* Una cadena vacía quita el valor guardado */
const CLEARABLE_FIELDS = ['imageMobile', 'ctaUrl', 'notice', 'startAt', 'endAt'];

const slideImages = (slide) => [slide.image, slide.imageMobile].filter(Boolean);

const applyFields = (slide, body) => {
    VALUE_FIELDS.forEach((field) => {
        if (body[field] !== undefined) slide[field] = body[field];
    });
    CLEARABLE_FIELDS.forEach((field) => {
        if (body[field] !== undefined) slide[field] = body[field] || undefined;
    });
};

/* Las reglas entre campos se revisan sobre la diapositiva ya combinada: una edición parcial no debe dejarla inconsistente.
   La noticia y las imágenes solo se comprueban si cambiaron, para poder seguir editando una diapositiva con datos que ya no existen */
const findProblem = async (slide, addedImages) => {
    if (slide.ctaUrl && slide.notice) return 'Choose a web address or a notice for the button, not both';
    if (slide.ctaLabel && !slide.ctaUrl && !slide.notice) return 'The button text needs a link';
    if (slide.startAt && slide.endAt && slide.endAt <= slide.startAt) return 'The end must be after the start';
    if (slide.notice && slide.isModified('notice') && !await Notice.exists({ _id: slide.notice })) return 'Notice not found';
    if ((await findMissingUploads(addedImages)).length) return 'Image not found';
    return null;
};

const adminView = async (slide) => {
    await slide.populate('notice', 'title');
    return serializeAdminSlide(slide.toObject());
};

/* Portada pública: diapositivas activas y vigentes, más las noticias destacadas si el panel lo pide */
export const getHero = async (req, res) => {
    const now = new Date();
    const [slides, settings] = await Promise.all([
        HeroSlide.find(publicSlideFilter(now)).sort(inOrder).lean(),
        getHeroSettings()
    ]);

    const linkedIds = slides.filter((slide) => slide.notice).map((slide) => slide.notice);
    const visibleNotices = linkedIds.length
        ? await Notice.find({ _id: { $in: linkedIds }, ...publicNoticeFilter(now) }).select('_id').lean()
        : [];
    const visibleNoticeIds = new Set(visibleNotices.map((notice) => String(notice._id)));
    const items = slides.map((slide) => serializePublicSlide(slide, visibleNoticeIds));

    if (settings.includeFeatured) {
        const featured = await Notice.find({
            ...publicNoticeFilter(now),
            featured: true,
            imageUrl: { $nin: [null, ''] },
            _id: { $nin: linkedIds }
        }).select('title description imageUrl imageAlt').sort(newestFirst).limit(MAX_FEATURED_SLIDES).lean();
        items.push(...featured.map(serializeNoticeSlide));
    }

    return res.json({ intervalSeconds: settings.intervalSeconds, slides: items });
};

export const getSlides = async (req, res) => {
    const now = new Date();
    const [slides, settings] = await Promise.all([
        HeroSlide.find().sort(inOrder).populate('notice', 'title').lean(),
        getHeroSettings()
    ]);
    return res.json({ slides: slides.map((slide) => serializeAdminSlide(slide, now)), settings });
};

export const createSlide = async (req, res) => {
    if (await HeroSlide.countDocuments() >= MAX_SLIDES) return res.status(400).json([`There can be at most ${MAX_SLIDES} slides`]);

    const last = await HeroSlide.findOne().sort({ order: -1 }).select('order').lean();
    const slide = new HeroSlide({ order: (last?.order ?? -1) + 1, createdBy: req.user.id });
    applyFields(slide, req.body);

    const problem = await findProblem(slide, slideImages(slide));
    if (problem) return res.status(400).json([problem]);

    await slide.save();
    return res.status(201).json(await adminView(slide));
};

export const updateSlide = async (req, res) => {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });

    const previousImages = slideImages(slide);
    applyFields(slide, req.body);

    const nextImages = slideImages(slide);
    const problem = await findProblem(slide, nextImages.filter((url) => !previousImages.includes(url)));
    if (problem) return res.status(400).json([problem]);

    await slide.save();
    await removeUnreferencedUploads(previousImages.filter((url) => !nextImages.includes(url)), { excludeSlideId: slide._id });
    return res.json(await adminView(slide));
};

export const deleteSlide = async (req, res) => {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });

    await removeUnreferencedUploads(slideImages(slide), { excludeSlideId: slide._id });
    return res.sendStatus(204);
};

/* La lista debe traer todas las diapositivas una sola vez: si otro administrador agregó o quitó alguna, el panel debe recargar */
export const reorderSlides = async (req, res) => {
    const ids = req.body.ids.map((id) => id.toLowerCase());
    if (new Set(ids).size !== ids.length) return res.status(400).json(['The list has repeated slides']);

    const known = new Set((await HeroSlide.find().select('_id').lean()).map((slide) => String(slide._id)));
    if (known.size !== ids.length || !ids.every((id) => known.has(id))) {
        return res.status(409).json({ message: 'The slides changed, reload the list', code: 'SLIDES_CHANGED' });
    }

    await HeroSlide.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })));
    return getSlides(req, res);
};

export const updateSettings = async (req, res) => res.json(await saveHeroSettings(req.body));
