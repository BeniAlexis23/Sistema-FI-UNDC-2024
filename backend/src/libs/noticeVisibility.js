/* Una noticia es pública si no está oculta y su programación (publishAt) ya llegó.
   El `date` legado no afecta la visibilidad: solo es la fecha que se muestra. */

export const publicNoticeFilter = (now = new Date()) => ({
    hidden: { $ne: true },
    $or: [{ publishAt: null }, { publishAt: { $lte: now } }]
});

export const getNoticeStatus = (notice, now = new Date()) => {
    if (notice.hidden) return 'hidden';
    if (notice.publishAt && new Date(notice.publishAt) > now) return 'scheduled';
    return 'published';
};
