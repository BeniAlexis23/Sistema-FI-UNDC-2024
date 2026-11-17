import { getEventStatus } from './eventStatus.js';

const idOf = (reference) => String(reference?._id ?? reference);
const orNull = (value) => (value === undefined || value === '' ? null : value);

/* Edición vigente de una serie: la destacada si está visible; si no, la de mayor número entre las visibles */
export const pickCurrentEdition = (editions) => {
    const visible = editions.filter((edition) => !edition.hidden);
    return visible.find((edition) => edition.destacada)
        ?? visible.reduce((latest, edition) => (!latest || edition.numero > latest.numero ? edition : latest), null);
};

const serializeLinkedNotice = (notice) => ({
    id: idOf(notice),
    title: notice.title,
    imageUrl: orNull(notice.imageUrl),
    imageAlt: notice.imageAlt ?? '',
    date: notice.date ?? null
});

export const serializePublicEdition = (edition, now = new Date()) => ({
    id: idOf(edition),
    numero: edition.numero,
    numeral: edition.numeral,
    titulo: edition.titulo ?? '',
    semestre: orNull(edition.semestre),
    fechaInicio: edition.fechaInicio ?? null,
    fechaFin: edition.fechaFin ?? null,
    sede: edition.sede ?? '',
    url: orNull(edition.url),
    portada: orNull(edition.portada),
    portadaAlt: edition.portadaAlt ?? '',
    resumen: edition.resumen ?? '',
    destacada: Boolean(edition.destacada),
    estado: getEventStatus(edition, now)
});

/* Las noticias llegan ya filtradas por visibilidad (populate con match); las eliminadas quedan como null */
export const serializePublicEditionWithNotices = (edition, now = new Date()) => ({
    ...serializePublicEdition(edition, now),
    noticias: (edition.noticias ?? []).filter((notice) => notice && notice.title).map(serializeLinkedNotice)
});

const seriesFields = (series) => ({
    slug: series.slug,
    nombre: series.nombre,
    sigla: series.sigla,
    descripcion: series.descripcion ?? '',
    urlPermanente: series.urlPermanente,
    logo: orNull(series.logo),
    logoAlt: series.logoAlt ?? '',
    color: orNull(series.color),
    orden: series.orden ?? 0
});

export const serializePublicSeries = (series, editions, now = new Date()) => {
    const current = pickCurrentEdition(editions);
    return {
        ...seriesFields(series),
        actual: current ? serializePublicEdition(current, now) : null,
        totalEdiciones: editions.filter((edition) => !edition.hidden).length
    };
};

export const serializeAdminSeries = (series, totalEdiciones = 0) => ({
    _id: idOf(series),
    ...seriesFields(series),
    activo: series.activo !== false,
    totalEdiciones,
    createdAt: series.createdAt,
    updatedAt: series.updatedAt
});

const serializeSeriesReference = (serie) => (serie?.slug
    ? { _id: idOf(serie), slug: serie.slug, sigla: serie.sigla, nombre: serie.nombre }
    : { _id: idOf(serie), slug: null, sigla: null, nombre: null });

export const serializeAdminEdition = (edition, now = new Date()) => {
    const { id, ...fields } = serializePublicEdition(edition, now);
    return {
        _id: id,
        serie: serializeSeriesReference(edition.serie),
        ...fields,
        hidden: Boolean(edition.hidden),
        noticias: (edition.noticias ?? []).filter(Boolean).map((notice) => (notice.title !== undefined
            ? { _id: idOf(notice), title: notice.title }
            : { _id: idOf(notice), title: null })),
        createdAt: edition.createdAt,
        updatedAt: edition.updatedAt
    };
};
