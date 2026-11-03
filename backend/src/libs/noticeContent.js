import { htmlToPlainText } from './sanitize.js';
import { readingMinutesFor } from './readingTime.js';
import { truncate } from './text.js';

export const SUMMARY_MAX_CHARS = 300;

const textBlocks = (content) => content.filter((block) => block.type === 'text');
const textOf = (blocks) => blocks.map((block) => htmlToPlainText(block.html)).join(' ');

/* Campos derivados del contenido: tiempo de lectura (texto y avisos) y resumen (primer bloque de texto) */
export const deriveContentFields = (content) => ({
    readingMinutes: readingMinutesFor(textOf(content.filter((block) => block.type === 'text' || block.type === 'callout'))),
    summary: truncate(textOf(textBlocks(content).slice(0, 1)), SUMMARY_MAX_CHARS)
});

export const exceedsSummaryLimit = (summary) => Array.from(summary).length > SUMMARY_MAX_CHARS;
