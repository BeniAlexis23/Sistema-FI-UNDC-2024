import { fromLimaInput, toLimaInput } from '../../utils/noticeDate';
import { toRoman } from './eventFormat';

/* Formularios del panel de eventos: conversión entre lo que guarda la API y lo que editan los campos */

const isHttpUrl = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/* «Jornada de Exposición» -> «jornada-de-exposicion» */
export const slugify = (value = '') => value
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

/* ---- Series ---- */

export const emptySeriesForm = () => ({
  slug: '', nombre: '', sigla: '', descripcion: '', urlPermanente: '', logo: '', logoAlt: '', color: '', orden: 0, activo: true,
});

export const seriesToForm = (series) => ({
  ...emptySeriesForm(),
  ...Object.fromEntries(Object.keys(emptySeriesForm()).map((key) => [key, series?.[key] ?? emptySeriesForm()[key]])),
});

export const validateSeriesForm = (form) => {
  const errors = [];
  if (!form.sigla.trim()) errors.push('Escribe la sigla del evento.');
  if (!form.nombre.trim()) errors.push('Escribe el nombre del evento.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim()) || form.slug.trim().length < 2) {
    errors.push('El identificador solo puede tener minúsculas, números y guiones (por ejemplo, jepa).');
  }
  if (!isHttpUrl(form.urlPermanente.trim())) errors.push('La dirección permanente debe empezar con https:// o http://.');
  if (form.color && !/^#[0-9a-f]{6}$/i.test(form.color)) errors.push('El color debe tener la forma #1081ea.');
  if (!Number.isInteger(Number(form.orden)) || Number(form.orden) < 0) errors.push('El orden debe ser un número entero desde 0.');
  return errors;
};

export const seriesFormToPayload = (form) => ({
  slug: form.slug.trim().toLowerCase(),
  nombre: form.nombre.trim(),
  sigla: form.sigla.trim(),
  descripcion: form.descripcion.trim(),
  urlPermanente: form.urlPermanente.trim(),
  logo: form.logo || '',
  logoAlt: form.logo ? form.logoAlt.trim() : '',
  color: form.color || '',
  orden: Number(form.orden) || 0,
  activo: Boolean(form.activo),
});

/* ---- Ediciones ---- */

export const emptyEditionForm = (serie = '') => ({
  serie, numero: '', numeral: '', titulo: '', semestre: '', fechaInicio: '', fechaFin: '', sede: '', url: '',
  portada: '', portadaAlt: '', resumen: '', destacada: false, hidden: false, noticias: [],
});

/* El numeral solo se guarda en el formulario si es distinto del automático */
export const editionToForm = (edition) => ({
  serie: edition.serie?._id ?? edition.serie ?? '',
  numero: edition.numero ?? '',
  numeral: edition.numeral && edition.numeral !== toRoman(edition.numero) ? edition.numeral : '',
  titulo: edition.titulo ?? '',
  semestre: edition.semestre ?? '',
  fechaInicio: toLimaInput(edition.fechaInicio),
  fechaFin: toLimaInput(edition.fechaFin),
  sede: edition.sede ?? '',
  url: edition.url ?? '',
  portada: edition.portada ?? '',
  portadaAlt: edition.portadaAlt ?? '',
  resumen: edition.resumen ?? '',
  destacada: Boolean(edition.destacada),
  hidden: Boolean(edition.hidden),
  noticias: (edition.noticias ?? []).map((notice) => ({ _id: notice._id, title: notice.title })),
});

export const numeralPreview = (form) => form.numeral.trim().toUpperCase() || toRoman(form.numero);

export const validateEditionForm = (form) => {
  const errors = [];
  if (!form.serie) errors.push('Elige el evento al que pertenece la edición.');
  const numero = Number(form.numero);
  if (form.numero === '' || !Number.isInteger(numero) || numero < 1 || numero > 999) errors.push('El número de edición debe ser un entero entre 1 y 999.');
  if (form.numeral.trim() && !/^[IVXLCDM]{1,15}$/i.test(form.numeral.trim())) errors.push('El numeral debe escribirse en números romanos (por ejemplo, VIII).');
  if (form.semestre.trim() && !/^\d{4}-(?:0|I|II)$/i.test(form.semestre.trim())) errors.push('El semestre debe tener la forma 2026-I o 2026-II.');
  if (form.fechaFin && !form.fechaInicio) errors.push('Para indicar el fin, indica también el inicio.');
  if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio) errors.push('El fin no puede ser antes del inicio.');
  if (form.url.trim() && !isHttpUrl(form.url.trim())) errors.push('La dirección del sitio debe empezar con https:// o http://.');
  return errors;
};

export const editionFormToPayload = (form) => ({
  serie: form.serie,
  numero: Number(form.numero),
  numeral: form.numeral.trim().toUpperCase(),
  titulo: form.titulo.trim(),
  semestre: form.semestre.trim().toUpperCase(),
  fechaInicio: fromLimaInput(form.fechaInicio),
  fechaFin: fromLimaInput(form.fechaFin),
  sede: form.sede.trim(),
  url: form.url.trim(),
  portada: form.portada || '',
  portadaAlt: form.portada ? form.portadaAlt.trim() : '',
  resumen: form.resumen.trim(),
  destacada: Boolean(form.destacada),
  hidden: Boolean(form.hidden),
  noticias: form.noticias.map((notice) => notice._id),
});
