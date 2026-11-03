import { fromLimaInput, toLimaInput } from '../../utils/noticeDate';

export const MAX_SLIDES = 20;
export const LIMITS = { alt: 200, title: 100, subtitle: 200, ctaLabel: 40, ctaUrl: 2048 };
export const MIN_DESKTOP_WIDTH = 1600;
export const MIN_MOBILE_WIDTH = 750;

// Texto del botón que el servidor usa cuando se deja vacío
export const DEFAULT_LINK_LABELS = { notice: 'Leer noticia', url: 'Más información' };

export const emptyForm = () => ({
  image: '',
  imageMobile: '',
  alt: '',
  title: '',
  subtitle: '',
  linkType: 'none',
  ctaLabel: '',
  ctaUrl: '',
  notice: '',
  focusX: 50,
  focusY: 50,
  active: true,
  startAt: '',
  endAt: '',
});

/* `slide` es la diapositiva como la entrega el panel (la noticia viene como { _id, title }) */
export const formFromSlide = (slide) => {
  const linkType = slide.notice ? 'notice' : slide.ctaUrl ? 'url' : 'none';
  return {
    image: slide.image,
    imageMobile: slide.imageMobile || '',
    alt: slide.alt || '',
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    linkType,
    ctaLabel: slide.ctaLabel || '',
    ctaUrl: slide.ctaUrl || '',
    notice: slide.notice?._id || '',
    focusX: slide.focusX ?? 50,
    focusY: slide.focusY ?? 50,
    active: Boolean(slide.active),
    startAt: toLimaInput(slide.startAt),
    endAt: toLimaInput(slide.endAt),
  };
};

/* Lo que se envía al servidor: una cadena vacía quita el valor guardado, así sirve igual para crear y para editar.
   Solo se conserva el destino del botón elegido y su texto. */
export const toPayload = (form) => ({
  image: form.image,
  imageMobile: form.imageMobile,
  alt: form.alt.trim(),
  title: form.title.trim(),
  subtitle: form.subtitle.trim(),
  ctaLabel: form.linkType === 'none' ? '' : form.ctaLabel.trim(),
  ctaUrl: form.linkType === 'url' ? form.ctaUrl.trim() : '',
  notice: form.linkType === 'notice' ? form.notice : '',
  focusX: form.focusX,
  focusY: form.focusY,
  active: form.active,
  startAt: fromLimaInput(form.startAt),
  endAt: fromLimaInput(form.endAt),
});

// Mismos esquemas que acepta el servidor para los enlaces del botón
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];

export const isSafeLink = (value) => {
  try {
    return SAFE_PROTOCOLS.includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/* Motivos por los que no se puede guardar; vacío si todo está en orden */
export const validateForm = (form) => {
  const problems = [];
  if (!form.image) problems.push('Elige la imagen principal.');
  if (form.linkType === 'notice' && !form.notice) problems.push('Elige la noticia a la que llevará el botón.');
  if (form.linkType === 'url') {
    const url = form.ctaUrl.trim();
    if (!url) problems.push('Escribe la dirección a la que llevará el botón.');
    else if (!isSafeLink(url)) problems.push('La dirección debe empezar con https:// (también se aceptan http:// y mailto:).');
  }
  if (form.startAt && form.endAt && fromLimaInput(form.endAt) <= fromLimaInput(form.startAt)) {
    problems.push('El fin de la programación debe ser posterior al inicio.');
  }
  return problems;
};

/* Avisos (no bloquean) sobre el tamaño de una imagen ya cargada */
export const imageNotes = (size, kind = 'desktop') => {
  if (!size?.width) return [];

  const notes = [];
  const mobile = kind === 'mobile';
  if (size.width < (mobile ? MIN_MOBILE_WIDTH : MIN_DESKTOP_WIDTH)) {
    notes.push(`La imagen mide ${size.width} px de ancho; se recomienda ${mobile ? 'al menos 1080 px' : '1920 px o más'} para que no se vea borrosa.`);
  }
  if (!mobile && size.height && size.width / size.height < 1.5) {
    notes.push('La imagen es poco apaisada: en pantallas anchas se recortará arriba y abajo. Usa el punto de enfoque para elegir la zona que se conserva.');
  }
  return notes;
};

/* Botón tal como lo mostrará el carrusel, para la vista previa del panel */
export const previewLink = (form) => {
  if (form.linkType === 'none') return null;
  return {
    label: form.ctaLabel.trim() || DEFAULT_LINK_LABELS[form.linkType],
    url: '#',
    internal: form.linkType === 'notice',
  };
};
