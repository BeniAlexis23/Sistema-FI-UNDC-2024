import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { legacyToBlocks } from '../legacyToBlocks';
import { htmlToText } from '../readingTime';
import { parseVideoUrl } from '../video';
import { fromLimaInput, toLimaInput } from '../../utils/noticeDate';

dayjs.extend(utc);

export const SUMMARY_MAX = 300;
const SAFE_LINK = /^(?:https?:\/\/|mailto:)\S+$/i;

const todayInLima = () => toLimaInput(new Date().toISOString()).slice(0, 10);

export const emptyForm = () => ({
  title: '',
  summary: '',
  categoryId: '',
  byline: '',
  coverUrl: '',
  coverChanged: false,
  imageAlt: '',
  mode: 'published',
  displayDate: todayInLima(),
  publishAtLocal: '',
  featured: false,
  blocks: [],
  baseUpdatedAt: null,
});

/* Convierte la noticia del servidor en el estado del formulario. Las noticias anteriores al editor por bloques
   guardaban todo el cuerpo en `description`: se convierte en bloques de texto para no perderlo al guardar. */
export const formFromNotice = (notice) => {
  const hasBlocks = (notice.content ?? []).length > 0;
  const upcoming = notice.publishAt && new Date(notice.publishAt) > new Date();
  const modes = { hidden: 'hidden', scheduled: 'scheduled' };

  return {
    title: notice.title ?? '',
    summary: hasBlocks ? notice.description ?? '' : '',
    categoryId: notice.category?._id ?? '',
    byline: notice.byline ?? '',
    coverUrl: notice.imageUrl ?? '',
    coverChanged: false,
    imageAlt: notice.imageAlt ?? '',
    mode: modes[notice.status] ?? 'published',
    displayDate: notice.date ? dayjs.utc(notice.date).format('YYYY-MM-DD') : todayInLima(),
    publishAtLocal: upcoming ? toLimaInput(notice.publishAt) : '',
    featured: Boolean(notice.featured),
    blocks: hasBlocks ? notice.content : legacyToBlocks(notice.description ?? ''),
    baseUpdatedAt: notice.updatedAt ?? null,
  };
};

/* Un bloque recién agregado y sin llenar no se guarda ni se valida */
export const isEmptyBlock = (block) => {
  switch (block.type) {
    case 'text':
    case 'callout':
      return htmlToText(block.html) === '';
    case 'image':
      return !block.url;
    case 'gallery':
      return (block.images ?? []).length === 0;
    case 'video':
      return !(block.url ?? '').trim();
    case 'button':
      return !(block.label ?? '').trim() && !(block.url ?? '').trim();
    default:
      return false;
  }
};

/* Solo los campos que el servidor acepta (rechaza claves desconocidas) */
const toApiBlock = (block) => {
  switch (block.type) {
    case 'text':
      return { id: block.id, type: 'text', html: block.html };
    case 'callout':
      return { id: block.id, type: 'callout', variant: block.variant, html: block.html };
    case 'image':
      return { id: block.id, type: 'image', url: block.url, alt: block.alt ?? '', caption: block.caption ?? '', width: block.width ?? 'normal' };
    case 'gallery':
      return {
        id: block.id,
        type: 'gallery',
        layout: block.layout,
        images: block.images.map((image) => ({ url: image.url, alt: image.alt ?? '', caption: image.caption ?? '' })),
      };
    case 'video':
      return { id: block.id, type: 'video', url: block.url.trim(), caption: block.caption ?? '' };
    case 'button':
      return { id: block.id, type: 'button', label: block.label.trim(), url: block.url.trim(), style: block.style ?? 'primary' };
    default:
      return { id: block.id, type: block.type };
  }
};

export const cleanBlocks = (blocks) => blocks.filter((block) => !isEmptyBlock(block)).map(toApiBlock);

/* Bloques tal como los mostraría el portal: los videos llevan proveedor e identificador, como los devuelve el servidor */
export const toPreviewBlocks = (blocks) => cleanBlocks(blocks).map((block) => (
  block.type === 'video' ? { ...block, ...parseVideoUrl(block.url) } : block
));

/* Mensajes para mostrar antes de guardar; lista vacía si todo está bien */
export const validateForm = (form) => {
  const errors = [];
  if (!form.title.trim()) errors.push('El título es obligatorio.');
  if (Array.from(form.summary).length > SUMMARY_MAX) errors.push(`El resumen no puede superar los ${SUMMARY_MAX} caracteres.`);
  if (form.mode === 'scheduled' && !form.publishAtLocal) errors.push('Elige la fecha y la hora en que se publicará.');
  if (form.mode !== 'scheduled' && !form.displayDate) errors.push('Elige la fecha que se mostrará en la noticia.');

  form.blocks.forEach((block, index) => {
    if (isEmptyBlock(block)) return;
    const label = `Bloque ${index + 1}`;
    if (block.type === 'video' && !parseVideoUrl(block.url)) {
      errors.push(`${label} (video): el enlace debe ser de YouTube, Vimeo o Facebook.`);
    }
    if (block.type === 'button') {
      if (!block.label.trim()) errors.push(`${label} (botón): escribe el texto del botón.`);
      if (!SAFE_LINK.test(block.url.trim())) errors.push(`${label} (botón): el enlace debe empezar con https://, http:// o mailto:.`);
    }
  });
  return errors;
};

/* Cuerpo de la petición. Una cadena vacía le indica al servidor que quite el valor guardado. */
export const toApiPayload = (form, { isEdit }) => {
  const scheduled = form.mode === 'scheduled';
  const summary = form.summary.trim();

  return {
    title: form.title.trim(),
    content: cleanBlocks(form.blocks),
    hidden: form.mode === 'hidden',
    featured: form.featured,
    category: form.categoryId,
    byline: form.byline.trim(),
    imageAlt: form.imageAlt.trim(),
    publishAt: scheduled ? fromLimaInput(form.publishAtLocal) : '',
    ...(summary && { description: summary }),
    // al programar, el servidor deriva la fecha que se muestra del día de publicación
    ...(!scheduled && { date: dayjs.utc(form.displayDate).format() }),
    ...(form.coverChanged && { imageUrl: form.coverUrl }),
    ...(isEdit && form.baseUpdatedAt && { baseUpdatedAt: form.baseUpdatedAt }),
  };
};
