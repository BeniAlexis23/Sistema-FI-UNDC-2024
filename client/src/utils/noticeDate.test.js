import { describe, expect, it } from 'vitest';
import {
  formatLimaDateTime, formatLongDate, formatNoticeDate, formatShortDate, fromLimaInput, toLimaInput,
} from './noticeDate.js';

describe('notice dates', () => {
  it('shows the stored calendar day without shifting it', () => {
    // medianoche UTC: en una zona horaria al oeste de UTC se vería un día antes si no se fijara UTC
    expect(formatShortDate('2026-04-17T00:00:00.000Z')).toBe('17/04/2026');
    expect(formatNoticeDate('2026-04-17T00:00:00.000Z')).toBe('17 abr, 2026');
    expect(formatLongDate('2026-04-17T00:00:00.000Z')).toBe('viernes 17 abr, 2026');
    expect(formatShortDate('')).toBe('');
    expect(formatShortDate(null)).toBe('');
  });

  it('converts between Lima local time and UTC instants', () => {
    expect(fromLimaInput('2026-11-10T09:00')).toBe('2026-11-10T14:00:00.000Z');
    expect(toLimaInput('2026-11-10T14:00:00.000Z')).toBe('2026-11-10T09:00');
    // cruce de día: las 21:00 de Lima ya son el día siguiente en UTC
    expect(fromLimaInput('2026-11-10T21:00')).toBe('2026-11-11T02:00:00.000Z');
    expect(toLimaInput('2026-11-11T02:00:00.000Z')).toBe('2026-11-10T21:00');
    expect(toLimaInput(fromLimaInput('2026-01-01T00:30'))).toBe('2026-01-01T00:30');
    expect(fromLimaInput('')).toBe('');
    expect(toLimaInput(null)).toBe('');
  });

  it('formats the schedule in Lima time', () => {
    expect(formatLimaDateTime('2026-11-10T14:00:00.000Z')).toBe('10 nov 2026, 09:00');
    expect(formatLimaDateTime('2026-11-11T02:00:00.000Z')).toBe('10 nov 2026, 21:00');
    expect(formatLimaDateTime(null)).toBe('');
  });
});
