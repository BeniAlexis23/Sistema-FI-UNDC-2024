import { describe, expect, it } from 'vitest';
import { endOfLimaDay, getEventStatus } from '../src/libs/eventStatus.js';
import { toRoman } from '../src/libs/roman.js';
import { pickCurrentEdition } from '../src/libs/eventSerializer.js';

const at = (iso) => new Date(iso);

describe('toRoman', () => {
    it('converts edition numbers to Roman numerals', () => {
        expect([1, 4, 5, 7, 8, 9, 14, 40, 90, 400, 1994, 3999].map(toRoman))
            .toEqual(['I', 'IV', 'V', 'VII', 'VIII', 'IX', 'XIV', 'XL', 'XC', 'CD', 'MCMXCIV', 'MMMCMXCIX']);
    });

    it('returns the value as text outside the Roman range', () => {
        expect(toRoman(0)).toBe('0');
        expect(toRoman(4000)).toBe('4000');
        expect(toRoman(2.5)).toBe('2.5');
        expect(toRoman(undefined)).toBe('');
    });
});

describe('getEventStatus', () => {
    const jepa = { fechaInicio: '2026-12-02T09:00:00-05:00', fechaFin: '2026-12-02T13:00:00-05:00' };

    it('has no status without a start date', () => {
        expect(getEventStatus({})).toBe('sin_fecha');
        expect(getEventStatus({ fechaInicio: null, fechaFin: '2026-12-02T13:00:00-05:00' })).toBe('sin_fecha');
        expect(getEventStatus({ fechaInicio: 'no es fecha' })).toBe('sin_fecha');
    });

    it('is upcoming before the start, running until the end and finished after it', () => {
        expect(getEventStatus(jepa, at('2026-11-17T12:00:00-05:00'))).toBe('proxima');
        expect(getEventStatus(jepa, at('2026-12-02T08:59:59-05:00'))).toBe('proxima');
        expect(getEventStatus(jepa, at('2026-12-02T09:00:00-05:00'))).toBe('en_curso');
        expect(getEventStatus(jepa, at('2026-12-02T12:59:59-05:00'))).toBe('en_curso');
        expect(getEventStatus(jepa, at('2026-12-02T13:00:00-05:00'))).toBe('finalizada');
    });

    it('lasts until the end of the Lima day when there is no end date', () => {
        const oneDay = { fechaInicio: '2026-07-17T00:00:00-05:00' };
        expect(getEventStatus(oneDay, at('2026-07-16T23:59:00-05:00'))).toBe('proxima');
        expect(getEventStatus(oneDay, at('2026-07-17T22:30:00-05:00'))).toBe('en_curso');
        // 23:59 en Lima ya es el día siguiente en UTC: sigue en curso
        expect(getEventStatus(oneDay, at('2026-07-18T04:59:00Z'))).toBe('en_curso');
        expect(getEventStatus(oneDay, at('2026-07-18T00:00:00-05:00'))).toBe('finalizada');
    });

    it('ignores an end that is not after the start', () => {
        const sameInstant = { fechaInicio: '2026-03-10T10:00:00-05:00', fechaFin: '2026-03-10T10:00:00-05:00' };
        expect(getEventStatus(sameInstant, at('2026-03-10T18:00:00-05:00'))).toBe('en_curso');
    });

    it('computes the end of the Lima day', () => {
        expect(new Date(endOfLimaDay(Date.parse('2026-12-02T20:00:00-05:00'))).toISOString()).toBe('2026-12-03T05:00:00.000Z');
        expect(new Date(endOfLimaDay(Date.parse('2026-12-02T00:00:00-05:00'))).toISOString()).toBe('2026-12-03T05:00:00.000Z');
    });
});

describe('pickCurrentEdition', () => {
    it('prefers the visible featured edition, else the visible one with the highest number', () => {
        const editions = [
            { numero: 7, destacada: true },
            { numero: 9, hidden: true },
            { numero: 8 }
        ];
        expect(pickCurrentEdition(editions).numero).toBe(7);
        expect(pickCurrentEdition([{ numero: 9, destacada: true, hidden: true }, { numero: 8 }, { numero: 6 }]).numero).toBe(8);
        expect(pickCurrentEdition([{ numero: 2, hidden: true }])).toBeNull();
        expect(pickCurrentEdition([])).toBeNull();
    });
});
