import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es';

dayjs.extend(utc);

const LIMA_OFFSET_HOURS = 5; // Perú es UTC-5 todo el año

/* Etiqueta y colores del estado que calcula el servidor (libs/eventStatus.js) */
export const EVENT_STATUS = {
  proxima: { label: 'Próximamente', className: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
  en_curso: { label: 'En curso', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  finalizada: { label: 'Finalizado', className: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
};

export const statusInfo = (estado) => EVENT_STATUS[estado] ?? null;

const NUMERALS = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];

/* Igual que backend/src/libs/roman.js: vista previa del numeral en el formulario */
export const toRoman = (value) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 3999) return '';
  let rest = number;
  let result = '';
  for (const [amount, numeral] of NUMERALS) {
    while (rest >= amount) {
      result += numeral;
      rest -= amount;
    }
  }
  return result;
};

const inLima = (instant) => dayjs.utc(instant).subtract(LIMA_OFFSET_HOURS, 'hour').locale('es');
const longDay = (moment) => moment.format('D [de] MMMM [de] YYYY');
const time = (moment) => moment.format('HH:mm');
const hasTime = (moment) => moment.hour() !== 0 || moment.minute() !== 0;

/* Fechas de una edición en hora de Lima: «2 de diciembre de 2026, 09:00 – 13:00», «17 de julio de 2026»,
   «28 de noviembre – 2 de diciembre de 2026» */
export const formatEventDates = (fechaInicio, fechaFin) => {
  if (!fechaInicio || Number.isNaN(Date.parse(fechaInicio))) return '';
  const start = inLima(fechaInicio);
  const end = fechaFin && !Number.isNaN(Date.parse(fechaFin)) ? inLima(fechaFin) : null;

  if (!end || end.isSame(start, 'minute')) return hasTime(start) ? `${longDay(start)}, ${time(start)}` : longDay(start);
  if (end.isSame(start, 'day')) {
    return hasTime(start) || hasTime(end) ? `${longDay(start)}, ${time(start)} – ${time(end)}` : longDay(start);
  }
  if (end.isSame(start, 'year')) {
    const startText = end.isSame(start, 'month') ? start.format('D') : start.format('D [de] MMMM');
    return `${startText} – ${longDay(end)}`;
  }
  return `${longDay(start)} – ${longDay(end)}`;
};

/* Texto corto para tarjetas: «2 dic 2026» */
export const formatEventShortDate = (fechaInicio) => (
  fechaInicio && !Number.isNaN(Date.parse(fechaInicio)) ? inLima(fechaInicio).format('D MMM YYYY').replace('.', '') : ''
);

/* Título visible de una edición: el que se escribió en el panel o «VIII JEPA» */
export const editionTitle = (edition, series) => (
  edition?.titulo || [edition?.numeral, series?.sigla].filter(Boolean).join(' ')
);

/* Dominio sin protocolo para mostrar junto a los enlaces: «jepa.episundc.pe» */
export const displayHost = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
};
