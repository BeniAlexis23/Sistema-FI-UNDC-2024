const WORDS_PER_MINUTE = 200;

/* Texto visible de un fragmento HTML, con los párrafos separados por espacios */
export const htmlToText = (html = '') => html
  .replace(/<\/(?:p|h[1-6]|li|blockquote|ul|ol)>|<br\s*\/?>/gi, ' ')
  .replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const readingMinutesFor = (text = '') => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

/* Tiempo de lectura de una lista de bloques (texto y avisos), igual que el cálculo del servidor */
export const readingMinutesForBlocks = (blocks = []) => readingMinutesFor(
  blocks
    .filter((block) => block.type === 'text' || block.type === 'callout')
    .map((block) => htmlToText(block.html))
    .join(' ')
);
