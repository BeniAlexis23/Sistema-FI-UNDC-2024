import { decodeBasicEntities } from './sanitize.js';
import { readingMinutesFor } from './readingTime.js';
import { getNoticeStatus } from './noticeVisibility.js';
import { truncateAtWord } from './text.js';

const SUMMARY_MAX_CHARS = 300;
const NEW_NOTICE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const serializeCategory = (category) => (
    category?.slug ? { _id: category._id, name: category.name, slug: category.slug } : null
);

/* «Nuevo» se calcula en el servidor (los relojes de los equipos pueden estar desajustados)
   y la edad se acota a >= 0 para que una fecha futura no cuente */
const isRecent = (notice, now) => {
    const age = now - new Date(notice.publishAt ?? notice.date);
    return age >= 0 && age < NEW_NOTICE_DAYS * DAY_MS;
};

/* sanitize-html guardaba el texto con entidades (&amp;); se decodifica al leer los datos legados */
const serializeFields = (notice, now) => {
    const description = decodeBasicEntities(notice.description);
    return {
        _id: notice._id,
        title: notice.title,
        description,
        imageUrl: notice.imageUrl ?? null,
        imageAlt: notice.imageAlt ?? '',
        date: notice.date,
        publishAt: notice.publishAt ?? null,
        featured: Boolean(notice.featured),
        byline: notice.byline ?? '',
        readingMinutes: notice.readingMinutes ?? readingMinutesFor(description),
        category: serializeCategory(notice.category),
        isNew: isRecent(notice, now),
        createdAt: notice.createdAt
    };
};

const serializeAdminFields = (notice, now) => ({
    hidden: Boolean(notice.hidden),
    status: getNoticeStatus(notice, now),
    author: notice.user?.username ?? null,
    updatedAt: notice.updatedAt
});

/* En listas `description` es solo un resumen: los datos legados guardaban ahí todo el cuerpo */
export const serializePublicNotice = (notice, now = new Date()) => {
    const fields = serializeFields(notice, now);
    return { ...fields, description: truncateAtWord(fields.description, SUMMARY_MAX_CHARS) };
};

export const serializePublicNoticeDetail = (notice, now = new Date()) => ({
    ...serializeFields(notice, now),
    content: notice.content ?? []
});

export const serializeAdminListItem = (notice, now = new Date()) => ({
    ...serializePublicNotice(notice, now),
    ...serializeAdminFields(notice, now)
});

export const serializeAdminNotice = (notice, now = new Date()) => ({
    ...serializeFields(notice, now),
    ...serializeAdminFields(notice, now),
    content: notice.content ?? [],
    user: notice.user
});
