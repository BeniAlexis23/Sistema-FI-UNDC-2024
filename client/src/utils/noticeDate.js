import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es';

dayjs.extend(utc);

const LIMA_OFFSET_HOURS = 5; // Perú es UTC-5 todo el año

/* `date` se guarda como fecha calendario a medianoche UTC: se muestra siempre en UTC para no correrse un día */
export const formatNoticeDate = (date, pattern = 'DD MMM, YYYY') => (
  date ? dayjs.utc(date).locale('es').format(pattern) : ''
);

export const formatShortDate = (date) => formatNoticeDate(date, 'DD/MM/YYYY');

export const formatLongDate = (date) => formatNoticeDate(date, 'dddd DD MMM, YYYY');

/* Fecha y hora de programación, en hora de Lima */
export const formatLimaDateTime = (instant) => (
  instant ? dayjs.utc(instant).subtract(LIMA_OFFSET_HOURS, 'hour').locale('es').format('DD MMM YYYY, HH:mm') : ''
);

/* Instante UTC (ISO) -> valor de <input type="datetime-local"> en hora de Lima */
export const toLimaInput = (instant) => (
  instant ? dayjs.utc(instant).subtract(LIMA_OFFSET_HOURS, 'hour').format('YYYY-MM-DDTHH:mm') : ''
);

/* Valor de <input type="datetime-local"> interpretado en hora de Lima -> instante UTC (ISO) */
export const fromLimaInput = (value) => (
  value ? dayjs.utc(value).add(LIMA_OFFSET_HOURS, 'hour').toISOString() : ''
);
