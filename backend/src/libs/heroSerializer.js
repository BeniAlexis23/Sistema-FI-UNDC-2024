import { getSlideStatus } from './heroVisibility.js';
import { htmlToPlainText } from './sanitize.js';
import { truncateAtWord } from './text.js';

const SUBTITLE_FROM_NOTICE_CHARS = 160;

const idOf = (reference) => String(reference?._id ?? reference);

/* El botón apunta a una noticia solo mientras esa noticia sea visible; si se oculta o se elimina, la diapositiva sigue sin enlace */
const slideLink = (slide, visibleNoticeIds) => {
    if (slide.notice && visibleNoticeIds.has(idOf(slide.notice))) {
        return { label: slide.ctaLabel || 'Leer noticia', url: `/noticias/${idOf(slide.notice)}`, internal: true };
    }
    if (slide.ctaUrl) return { label: slide.ctaLabel || 'Más información', url: slide.ctaUrl, internal: false };
    return null;
};

export const serializePublicSlide = (slide, visibleNoticeIds) => ({
    id: String(slide._id),
    image: slide.image,
    imageMobile: slide.imageMobile ?? null,
    alt: slide.alt ?? '',
    title: slide.title ?? '',
    subtitle: slide.subtitle ?? '',
    focusX: slide.focusX ?? 50,
    focusY: slide.focusY ?? 50,
    link: slideLink(slide, visibleNoticeIds)
});

/* Una noticia destacada con portada se muestra como diapositiva */
export const serializeNoticeSlide = (notice) => ({
    id: `notice-${notice._id}`,
    image: notice.imageUrl,
    imageMobile: null,
    alt: notice.imageAlt || notice.title,
    title: notice.title,
    subtitle: truncateAtWord(htmlToPlainText(notice.description), SUBTITLE_FROM_NOTICE_CHARS),
    focusX: 50,
    focusY: 50,
    link: { label: 'Leer noticia', url: `/noticias/${notice._id}`, internal: true }
});

export const serializeAdminSlide = (slide, now = new Date()) => ({
    _id: slide._id,
    image: slide.image,
    imageMobile: slide.imageMobile ?? '',
    alt: slide.alt ?? '',
    title: slide.title ?? '',
    subtitle: slide.subtitle ?? '',
    ctaLabel: slide.ctaLabel ?? '',
    ctaUrl: slide.ctaUrl ?? '',
    notice: slide.notice ? { _id: idOf(slide.notice), title: slide.notice.title ?? null } : null,
    focusX: slide.focusX ?? 50,
    focusY: slide.focusY ?? 50,
    active: Boolean(slide.active),
    startAt: slide.startAt ?? null,
    endAt: slide.endAt ?? null,
    order: slide.order ?? 0,
    status: getSlideStatus(slide, now),
    createdAt: slide.createdAt,
    updatedAt: slide.updatedAt
});
