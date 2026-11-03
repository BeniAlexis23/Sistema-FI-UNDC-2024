/* Una diapositiva se ve si está activa y dentro de su ventana de fechas (inicio inclusivo, fin exclusivo) */
export const publicSlideFilter = (now = new Date()) => ({
    active: true,
    $and: [
        { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: null }, { endAt: { $gt: now } }] }
    ]
});

export const getSlideStatus = (slide, now = new Date()) => {
    if (!slide.active) return 'inactive';
    if (slide.startAt && new Date(slide.startAt) > now) return 'scheduled';
    if (slide.endAt && new Date(slide.endAt) <= now) return 'expired';
    return 'active';
};
