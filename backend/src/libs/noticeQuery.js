import { publicNoticeFilter } from './noticeVisibility.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* `date` suele repetirse (solo-fecha), por eso el desempate por createdAt y _id */
export const newestFirst = { date: -1, createdAt: -1, _id: -1 };

const sorts = {
    date_desc: newestFirst,
    date_asc: { date: 1, createdAt: 1, _id: 1 },
    title_asc: { title: 1, _id: 1 }
};

export const adminNoticeSort = (sort = 'date_desc') => sorts[sort] ?? newestFirst;

/* Filtros del listado del panel: el editor solo ve lo suyo y el admin todo */
export const buildAdminNoticeFilter = (user, query = {}, now = new Date()) => {
    const { q, status, category, featured, from, to } = query;
    const conditions = [];

    if (user.role !== 'admin') conditions.push({ user: user._id });
    if (q) {
        const pattern = new RegExp(escapeRegex(q), 'i');
        conditions.push({ $or: [{ title: pattern }, { description: pattern }] });
    }
    if (status === 'hidden') conditions.push({ hidden: true });
    if (status === 'scheduled') conditions.push({ hidden: { $ne: true }, publishAt: { $gt: now } });
    if (status === 'published') conditions.push(publicNoticeFilter(now));
    if (category === 'none') conditions.push({ category: null });
    else if (category) conditions.push({ category });
    if (featured) conditions.push({ featured: true });
    if (from || to) conditions.push({ date: { ...(from && { $gte: from }), ...(to && { $lte: to }) } });

    return conditions.length ? { $and: conditions } : {};
};
