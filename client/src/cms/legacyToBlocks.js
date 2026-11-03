const HTML_TAGS = /<\/?(?:p|br|strong|b|em|i|u|s|ul|ol|li|h[1-6]|a|blockquote|span)\b[^>]*>/i;

/* Las noticias antiguas guardaban el cuerpo como texto plano (o, las más viejas, como HTML de un editor anterior) */
export const looksLikeHtml = (text = '') => HTML_TAGS.test(text);

const escapeHtml = (text) => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const blockId = (index) => `legacy${String(index + 1).padStart(3, '0')}`;

/* Convierte el cuerpo antiguo en bloques de texto para que el editor no lo pierda al guardar.
   En el texto plano cada salto de línea era un párrafo (el textarea no tenía otra forma de separarlos). */
export const legacyToBlocks = (description = '') => {
  const text = description.replace(/\r\n?/g, '\n').trim();
  if (!text) return [];
  if (looksLikeHtml(text)) return [{ id: blockId(0), type: 'text', html: text }];

  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({ id: blockId(index), type: 'text', html: `<p>${escapeHtml(line)}</p>` }));
};
