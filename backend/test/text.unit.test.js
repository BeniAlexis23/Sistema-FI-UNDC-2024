import { describe, expect, it } from 'vitest';
import { truncate, truncateAtWord } from '../src/libs/text.js';

describe('truncate', () => {
    it('cuts by code points so emojis are not split', () => {
        expect(truncate('😀😀😀😀', 2)).toBe('😀😀');
        expect(truncate('corto', 10)).toBe('corto');
    });
});

describe('truncateAtWord', () => {
    it('leaves short text untouched', () => {
        expect(truncateAtWord('Hola mundo', 20)).toBe('Hola mundo');
        expect(truncateAtWord('exacto', 6)).toBe('exacto');
    });

    it('cuts between words and marks it with an ellipsis, never exceeding the limit', () => {
        const text = 'La Facultad de Ingeniería realizó su semana académica con charlas y talleres';
        const result = truncateAtWord(text, 40);
        expect(result).toBe('La Facultad de Ingeniería realizó su…');
        expect(Array.from(result).length).toBeLessThanOrEqual(40);
    });

    it('falls back to a hard cut when there is no usable space', () => {
        const result = truncateAtWord('a'.repeat(100), 20);
        expect(result).toBe(`${'a'.repeat(19)}…`);
    });

    it('does not split emojis', () => {
        const result = truncateAtWord('😀 '.repeat(50).trim(), 11);
        expect(result.endsWith('…')).toBe(true);
        expect(Array.from(result).length).toBeLessThanOrEqual(11);
        expect(result).not.toMatch(/[\ud800-\udbff](?![\udc00-\udfff])/);
    });
});
