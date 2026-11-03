import { describe, expect, it } from 'vitest';
import { STATUS, describeLink, describeSchedule } from './heroStatus.js';

describe('slide status', () => {
  it('has a label for every status the server reports', () => {
    expect(Object.keys(STATUS).sort()).toEqual(['active', 'expired', 'inactive', 'scheduled']);
    expect(STATUS.scheduled.label).toBe('Programada');
  });

  it('describes the schedule in Lima time', () => {
    expect(describeSchedule({})).toBe('');
    expect(describeSchedule({ startAt: '2026-11-10T14:00:00.000Z' })).toBe('desde 10 nov 2026, 09:00');
    expect(describeSchedule({ endAt: '2026-11-11T02:00:00.000Z' })).toBe('hasta 10 nov 2026, 21:00');
    expect(describeSchedule({ startAt: '2026-11-10T14:00:00.000Z', endAt: '2026-11-11T02:00:00.000Z' }))
      .toBe('desde 10 nov 2026, 09:00 hasta 10 nov 2026, 21:00');
  });

  it('describes where the button goes', () => {
    expect(describeLink({})).toBe('');
    expect(describeLink({ ctaUrl: 'https://example.com' })).toBe('Botón a https://example.com');
    expect(describeLink({ notice: { _id: 'n1', title: 'Admisión' } })).toBe('Botón a la noticia «Admisión»');
    expect(describeLink({ notice: { _id: 'n1', title: null } })).toBe('Botón a la noticia «sin título»');
  });
});
