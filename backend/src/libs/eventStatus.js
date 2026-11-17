/* Estado de una edición según sus fechas. Perú está en UTC-5 todo el año: sin fecha de fin,
   el evento dura hasta el final del día (hora de Lima) en que empieza. */

const LIMA_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const EVENT_STATUSES = ['proxima', 'en_curso', 'finalizada', 'sin_fecha'];

const toTime = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? null : time;
};

/* Primer instante del día siguiente (en Lima) al instante dado */
export const endOfLimaDay = (instant) => {
    const limaTime = instant - LIMA_OFFSET_MS;
    const startOfLimaDay = Math.floor(limaTime / DAY_MS) * DAY_MS;
    return startOfLimaDay + DAY_MS + LIMA_OFFSET_MS;
};

export const getEventStatus = ({ fechaInicio, fechaFin } = {}, now = new Date()) => {
    const start = toTime(fechaInicio);
    if (start === null) return 'sin_fecha';

    const current = new Date(now).getTime();
    const explicitEnd = toTime(fechaFin);
    // inicio inclusivo, fin exclusivo; una fecha de fin anterior al inicio se ignora
    const end = explicitEnd !== null && explicitEnd > start ? explicitEnd : endOfLimaDay(start);

    if (current < start) return 'proxima';
    if (current < end) return 'en_curso';
    return 'finalizada';
};
