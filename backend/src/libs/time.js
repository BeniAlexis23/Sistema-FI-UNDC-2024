const LIMA_OFFSET_MS = -5 * 60 * 60 * 1000; // Perú no tiene horario de verano

/* Fecha calendario de Lima a medianoche UTC: así se guarda `date` y así la muestra dayjs.utc */
export const limaDayStart = (instant) => {
    const local = new Date(new Date(instant).getTime() + LIMA_OFFSET_MS);
    return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
};
