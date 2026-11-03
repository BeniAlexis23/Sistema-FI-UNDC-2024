import { decodeBasicEntities } from './sanitize.js';
import { readingMinutesFor } from './readingTime.js';

const serializeCategory = (category) => (
    category?.slug ? { _id: category._id, name: category.name, slug: category.slug } : null
);

/* sanitize-html guardaba el texto con entidades (&amp;); se decodifica al leer los datos legados */
const serializePublicFields = (notice) => {
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
        createdAt: notice.createdAt
    };
};

export const serializePublicNotice = (notice) => serializePublicFields(notice);

export const serializePublicNoticeDetail = (notice) => ({
    ...serializePublicFields(notice),
    content: notice.content ?? []
});
