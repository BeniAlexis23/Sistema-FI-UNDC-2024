/* Datos de los eventos para el menú, el pie de página y la portada. Sin dependencias de React para poder probarlo. */

export const ALL_EVENTS_ITEM = { label: 'Ver todos los eventos', to: '/eventos' };

/* Lo que enlazaba el menú antes del catálogo: se muestra si la API falla o aún no tiene series,
   para que el menú «Eventos» nunca quede vacío */
export const FALLBACK_SERIES = [
  { slug: 'ciisic', sigla: 'CIISIC', nombre: 'Congreso Internacional de Ingeniería de Sistemas e Informática', urlPermanente: 'https://ciisic-vii.episundc.pe/', actual: { numeral: 'VII' } },
  { slug: 'jepa', sigla: 'JEPA', nombre: 'Jornada de Exposición de Productos Académicos', urlPermanente: 'https://jepa.episundc.pe/', actual: { numeral: 'V' } },
  { slug: 'feinfo', sigla: 'FEINFO', nombre: 'Feria de Investigación Formativa', urlPermanente: 'https://uifi.episundc.pe/', actual: { numeral: 'IV' } },
];

const isHttpUrl = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/* «VIII JEPA»; sin edición vigente, solo la sigla */
export const seriesLabel = (series) => [series.actual?.numeral, series.sigla].filter(Boolean).join(' ');

/* Series -> ítems del menú (enlace a la dirección permanente de cada serie) más «Ver todos los eventos» */
export const toMenuItems = (series) => [
  ...(Array.isArray(series) ? series : [])
    .filter((item) => item?.sigla && isHttpUrl(item.urlPermanente))
    .map((item) => ({ label: seriesLabel(item), to: item.urlPermanente, external: true })),
  ALL_EVENTS_ITEM,
];

/* Respuesta de GET /eventos -> estado del hook. Una respuesta vacía o con otra forma usa la lista incluida en el sitio */
export const buildEventsState = (data) => {
  const series = Array.isArray(data) ? data.filter((item) => item?.slug && item?.sigla) : [];
  return series.length
    ? { source: 'api', series }
    : { source: 'fallback', series: FALLBACK_SERIES };
};

export const FALLBACK_STATE = { source: 'fallback', series: FALLBACK_SERIES };
