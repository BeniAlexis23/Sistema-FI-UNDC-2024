import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { legacyToBlocks } from '../legacyToBlocks';
import { htmlToText } from '../readingTime';
import { parseVideoUrl } from '../video';
import { fromLimaInput, toLimaInput } from '../../utils/noticeDate';

dayjs.extend(utc);

export const SUMMARY_MAX = 300;
const SAFE_LINK = /^(?:https?:\/\/|mailto:)\S+$/i;

export const SAVE_BLOCKED_MESSAGE = 'Un filtro del servidor bloqueó el guardado; no es un problema de tu sesión. Tu contenido sigue en esta pantalla: no la cierres y avisa al administrador. Si usas comillas « », prueba cambiándolas por “ ”: el filtro las confunde con etiquetas HTML antes de palabras como Image, Video o Formación.';

/* El Apache de delante del servidor toma las comillas « y ‹ por «<» y rechaza la petición con un 403 (en el título, en un
   texto o en un pie de foto) cuando siguen palabras que parecen una etiqueta HTML: «Image, «Video, «Formación…
   Comprobado contra producción el 2026-11-04. Un espacio después de « no ayuda; las comillas “ ” o " " sí pasan.
   Algunas palabras fallan aunque sigan con letras (Form, Script, Style, Svg, Marquee, Xml: «Formación, «Styles) y el resto
   solo cuando la palabra termina ahí (se rechaza «Image …, no «Imagen ni «Imágenes). */
const BLOCKED_PREFIXES = ['form', 'script', 'style', 'svg', 'marquee', 'xml'];
const BLOCKED_WORDS = [
  'animate', 'applet', 'audio', 'base', 'bindings', 'body', 'embed', 'frame', 'iframe', 'image', 'img', 'isindex', 'link', 'meta',
  'noscript', 'object', 'param', 'select', 'set', 'video', 'xss',
];
const FILTER_TRAP = new RegExp(
  `[«‹][^\\p{L}\\p{N}_<>]*(?:(?:${BLOCKED_PREFIXES.join('|')})\\p{L}*|(?:${BLOCKED_WORDS.join('|')})(?=[^\\p{L}\\p{N}_>»›]))`,
  'iu',
);

/* Devuelve el fragmento que el filtro del servidor rechazaría (por ejemplo «Image), o null */
export const findFilterTrap = (text) => (typeof text === 'string' ? text.match(FILTER_TRAP)?.[0] ?? null : null);

const BLOCK_NAMES = { text: 'texto', callout: 'aviso', image: 'imagen', gallery: 'galería', video: 'video', button: 'botón' };

// Los textos de un bloque que viajan al servidor
const blockTexts = (block) => {
  switch (block.type) {
    case 'text':
    case 'callout': return [block.html];
    case 'image': return [block.alt, block.caption];
    case 'gallery': return (block.images ?? []).flatMap((image) => [image.alt, image.caption]);
    case 'video': return [block.caption];
    case 'button': return [block.label];
    default: return [];
  }
};

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

  const warnFilterTrap = (where, texts) => {
    const trap = texts.map(findFilterTrap).find(Boolean);
    if (trap) errors.push(`${where}: el servidor rechaza ${trap}… (su filtro confunde la comilla « con una etiqueta HTML). Cambia « » por “ ” en ese texto.`);
  };
  warnFilterTrap('El título', [form.title]);
  warnFilterTrap('El resumen', [form.summary]);
  warnFilterTrap('El autor o fuente', [form.byline]);
  warnFilterTrap('La descripción de la portada', [form.imageAlt]);

  form.blocks.forEach((block, index) => {
    if (isEmptyBlock(block)) return;
    const label = `Bloque ${index + 1}`;
    warnFilterTrap(`${label} (${BLOCK_NAMES[block.type] ?? block.type})`, blockTexts(block));
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
