import { describe, expect, it } from 'vitest';
import { legacyToBlocks, looksLikeHtml } from './legacyToBlocks.js';
import { htmlToText, readingMinutesFor, readingMinutesForBlocks } from './readingTime.js';
import { thumbUrl } from './media.js';

describe('legacyToBlocks', () => {
  it('turns every line of a plain text body into a paragraph and keeps emojis', () => {
    const blocks = legacyToBlocks('Primera línea 🎓\r\nSegunda línea\r\n\r\n  Tercera  ');
    expect(blocks.map((block) => block.html)).toEqual([
      '<p>Primera línea 🎓</p>', '<p>Segunda línea</p>', '<p>Tercera</p>',
    ]);
    expect(new Set(blocks.map((block) => block.id)).size).toBe(3);
    expect(blocks.every((block) => block.type === 'text' && /^[A-Za-z0-9_-]{6,40}$/.test(block.id))).toBe(true);
  });

  it('escapes characters that would otherwise be read as markup', () => {
    expect(legacyToBlocks('2 < 3 & "citas" y 5 > 4 <nota>')[0].html)
      .toBe('<p>2 &lt; 3 &amp; &quot;citas&quot; y 5 &gt; 4 &lt;nota&gt;</p>');
  });

  it('keeps the HTML of old notices as a single block', () => {
    const html = '<p>Hola <strong>mundo</strong></p><ul><li>uno</li></ul>';
    expect(legacyToBlocks(html)).toEqual([{ id: 'legacy001', type: 'text', html }]);
  });

  it('returns nothing for an empty body', () => {
    expect(legacyToBlocks('')).toEqual([]);
    expect(legacyToBlocks('  \n \r\n ')).toEqual([]);
    expect(legacyToBlocks(undefined)).toEqual([]);
  });

  it('tells plain text from HTML', () => {
    expect(looksLikeHtml('<p>x</p>')).toBe(true);
    expect(looksLikeHtml('a <b>x</b>')).toBe(true);
    expect(looksLikeHtml('2 < 3 y 5 > 4')).toBe(false);
    expect(looksLikeHtml('solo texto')).toBe(false);
  });
});

describe('reading time', () => {
  it('counts words with a minimum of one minute', () => {
    expect(readingMinutesFor('')).toBe(1);
    expect(readingMinutesFor('palabra '.repeat(200))).toBe(1);
    expect(readingMinutesFor('palabra '.repeat(201))).toBe(2);
    expect(readingMinutesFor('palabra '.repeat(450))).toBe(3);
  });

  it('separates paragraphs and ignores tags', () => {
    expect(htmlToText('<p>uno</p><p>dos&nbsp;tres</p><ul><li>cuatro</li></ul>')).toBe('uno dos tres cuatro');
  });

  it('measures only text and callout blocks', () => {
    const words = (count) => `<p>${'palabra '.repeat(count)}</p>`;
    expect(readingMinutesForBlocks([
      { type: 'text', html: words(150) },
      { type: 'callout', html: words(100) },
      { type: 'image', url: '/uploads/x.webp' },
    ])).toBe(2);
    expect(readingMinutesForBlocks([])).toBe(1);
  });
});

describe('thumbUrl', () => {
  it('uses the thumbnail only for uploads made by the editor', () => {
    const uuid = '0b3f6a9e-1c2d-4e5f-8a7b-9c0d1e2f3a4b';
    expect(thumbUrl(`/uploads/${uuid}.webp`)).toBe(`/uploads/${uuid}-480.webp`);
    expect(thumbUrl('/uploads/1776436762557-dasd1.png')).toBe('/uploads/1776436762557-dasd1.png');
    expect(thumbUrl(undefined)).toBeUndefined();
  });
});
