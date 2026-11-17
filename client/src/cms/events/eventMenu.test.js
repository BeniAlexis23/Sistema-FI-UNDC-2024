import { describe, expect, it } from 'vitest';
import { ALL_EVENTS_ITEM, FALLBACK_SERIES, buildEventsState, seriesLabel, toMenuItems } from './eventMenu';

const apiSeries = [
  { slug: 'ciisic', sigla: 'CIISIC', nombre: 'Congreso', urlPermanente: 'https://ciisic-viii.episundc.pe/', actual: { numeral: 'VIII', estado: 'proxima' } },
  { slug: 'jepa', sigla: 'JEPA', nombre: 'Jornada', urlPermanente: 'https://jepa.episundc.pe/', actual: { numeral: 'VIII' } },
  { slug: 'nueva', sigla: 'NUEVA', nombre: 'Serie sin ediciones', urlPermanente: 'https://nueva.episundc.pe/', actual: null },
];

describe('toMenuItems', () => {
  it('links each series to its permanent URL and ends with the events page', () => {
    expect(toMenuItems(apiSeries)).toEqual([
      { label: 'VIII CIISIC', to: 'https://ciisic-viii.episundc.pe/', external: true },
      { label: 'VIII JEPA', to: 'https://jepa.episundc.pe/', external: true },
      { label: 'NUEVA', to: 'https://nueva.episundc.pe/', external: true },
      { label: 'Ver todos los eventos', to: '/eventos' },
    ]);
  });

  it('skips series without an acronym or with an unsafe link', () => {
    const items = toMenuItems([
      { sigla: 'X', urlPermanente: 'javascript:alert(1)', actual: { numeral: 'I' } },
      { sigla: '', urlPermanente: 'https://a.pe/' },
      null,
    ]);
    expect(items).toEqual([ALL_EVENTS_ITEM]);
    expect(toMenuItems(undefined)).toEqual([ALL_EVENTS_ITEM]);
  });

  it('reproduces the menu the site had before the catalog from the bundled list', () => {
    expect(toMenuItems(FALLBACK_SERIES)).toEqual([
      { label: 'VII CIISIC', to: 'https://ciisic-vii.episundc.pe/', external: true },
      { label: 'V JEPA', to: 'https://jepa.episundc.pe/', external: true },
      { label: 'IV FEINFO', to: 'https://uifi.episundc.pe/', external: true },
      { label: 'Ver todos los eventos', to: '/eventos' },
    ]);
  });

  it('labels a series with the numeral of its current edition', () => {
    expect(seriesLabel({ sigla: 'FEINFO', actual: { numeral: 'IV' } })).toBe('IV FEINFO');
    expect(seriesLabel({ sigla: 'FEINFO' })).toBe('FEINFO');
  });
});

describe('buildEventsState', () => {
  it('uses the API series when there are some', () => {
    expect(buildEventsState(apiSeries)).toEqual({ source: 'api', series: apiSeries });
  });

  it('falls back to the bundled list when the answer is empty or malformed', () => {
    for (const data of [[], null, undefined, { message: 'error' }, '<html>', [{ foo: 1 }]]) {
      expect(buildEventsState(data)).toEqual({ source: 'fallback', series: FALLBACK_SERIES });
    }
  });
});
