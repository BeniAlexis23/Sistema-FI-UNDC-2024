import { describe, expect, it } from 'vitest';
import { displayHost, editionTitle, formatEventDates, formatEventShortDate, statusInfo, toRoman } from './eventFormat';

describe('formatEventDates', () => {
  it('shows a single day with its hours in Lima time', () => {
    expect(formatEventDates('2026-12-02T14:00:00.000Z', '2026-12-02T18:00:00.000Z')).toBe('2 de diciembre de 2026, 09:00 – 13:00');
  });

  it('shows only the day when no time was given', () => {
    expect(formatEventDates('2026-07-17T05:00:00.000Z')).toBe('17 de julio de 2026');
    expect(formatEventDates('2026-07-17T05:00:00.000Z', null)).toBe('17 de julio de 2026');
  });

  it('shows the start time when there is no end', () => {
    expect(formatEventDates('2026-12-02T14:00:00.000Z')).toBe('2 de diciembre de 2026, 09:00');
  });

  it('shows ranges of several days', () => {
    expect(formatEventDates('2026-12-02T05:00:00.000Z', '2026-12-04T05:00:00.000Z')).toBe('2 – 4 de diciembre de 2026');
    expect(formatEventDates('2026-11-28T05:00:00.000Z', '2026-12-02T05:00:00.000Z')).toBe('28 de noviembre – 2 de diciembre de 2026');
    expect(formatEventDates('2026-12-30T05:00:00.000Z', '2027-01-02T05:00:00.000Z')).toBe('30 de diciembre de 2026 – 2 de enero de 2027');
  });

  it('does not shift a late evening to the next day', () => {
    expect(formatEventDates('2026-12-03T03:30:00.000Z')).toBe('2 de diciembre de 2026, 22:30');
  });

  it('returns nothing without a valid start', () => {
    expect(formatEventDates(null, '2026-12-02T18:00:00.000Z')).toBe('');
    expect(formatEventDates('no es fecha')).toBe('');
    expect(formatEventShortDate(null)).toBe('');
  });

  it('formats a short date for cards', () => {
    expect(formatEventShortDate('2026-12-02T14:00:00.000Z')).toBe('2 dic 2026');
  });
});

describe('event helpers', () => {
  it('converts numbers to Roman numerals for the form preview', () => {
    expect([1, 4, 8, 9, 14, 49].map(toRoman)).toEqual(['I', 'IV', 'VIII', 'IX', 'XIV', 'XLIX']);
    expect(toRoman('')).toBe('');
    expect(toRoman(0)).toBe('');
  });

  it('labels the status and leaves undated editions without a badge', () => {
    expect(statusInfo('proxima').label).toBe('Próximamente');
    expect(statusInfo('en_curso').label).toBe('En curso');
    expect(statusInfo('finalizada').label).toBe('Finalizado');
    expect(statusInfo('sin_fecha')).toBeNull();
  });

  it('builds a title and a display host', () => {
    expect(editionTitle({ titulo: 'VIII Jornada', numeral: 'VIII' }, { sigla: 'JEPA' })).toBe('VIII Jornada');
    expect(editionTitle({ numeral: 'VIII' }, { sigla: 'JEPA' })).toBe('VIII JEPA');
    expect(displayHost('https://jepa-vii.episundc.pe/')).toBe('jepa-vii.episundc.pe');
    expect(displayHost('nada')).toBe('');
  });
});
