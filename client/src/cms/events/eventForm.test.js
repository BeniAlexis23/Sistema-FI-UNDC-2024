import { describe, expect, it } from 'vitest';
import {
  editionFormToPayload, editionToForm, emptyEditionForm, emptySeriesForm, numeralPreview, seriesFormToPayload,
  slugify, validateEditionForm, validateSeriesForm,
} from './eventForm';

const SERIE = '6a1b2c3d4e5f6a7b8c9d0e1f';

describe('series form', () => {
  it('suggests a slug from a name', () => {
    expect(slugify('Jornada de Exposición  (JEPA)')).toBe('jornada-de-exposicion-jepa');
    expect(slugify('  CIISIC ')).toBe('ciisic');
  });

  it('validates the required fields', () => {
    expect(validateSeriesForm(emptySeriesForm())).toHaveLength(4);
    const valid = { ...emptySeriesForm(), slug: 'jepa', sigla: 'JEPA', nombre: 'Jornada', urlPermanente: 'https://jepa.episundc.pe/' };
    expect(validateSeriesForm(valid)).toEqual([]);
    expect(validateSeriesForm({ ...valid, color: 'azul', urlPermanente: 'ftp://x' })).toHaveLength(2);
  });

  it('builds the payload and drops the logo description without a logo', () => {
    const payload = seriesFormToPayload({
      ...emptySeriesForm(), slug: ' JEPA ', sigla: ' JEPA ', nombre: ' Jornada ', urlPermanente: 'https://jepa.episundc.pe/', logoAlt: 'Logo', orden: '2',
    });
    expect(payload).toEqual({
      slug: 'jepa', nombre: 'Jornada', sigla: 'JEPA', descripcion: '', urlPermanente: 'https://jepa.episundc.pe/',
      logo: '', logoAlt: '', color: '', orden: 2, activo: true,
    });
  });
});

describe('edition form', () => {
  const stored = {
    _id: 'x', serie: { _id: SERIE, sigla: 'JEPA' }, numero: 8, numeral: 'VIII', titulo: 'VIII JEPA', semestre: '2026-II',
    fechaInicio: '2026-12-02T14:00:00.000Z', fechaFin: '2026-12-02T18:00:00.000Z', sede: 'Casa de la Cultura',
    url: 'https://jepa.episundc.pe/', portada: null, portadaAlt: '', resumen: '', destacada: true, hidden: false,
    noticias: [{ _id: 'n1', title: 'Ganadores' }],
  };

  it('converts a stored edition to Lima-time inputs and back', () => {
    const form = editionToForm(stored);
    expect(form).toMatchObject({ serie: SERIE, numeral: '', fechaInicio: '2026-12-02T09:00', fechaFin: '2026-12-02T13:00', portada: '' });
    expect(editionFormToPayload(form)).toEqual({
      serie: SERIE, numero: 8, numeral: '', titulo: 'VIII JEPA', semestre: '2026-II',
      fechaInicio: '2026-12-02T14:00:00.000Z', fechaFin: '2026-12-02T18:00:00.000Z', sede: 'Casa de la Cultura',
      url: 'https://jepa.episundc.pe/', portada: '', portadaAlt: '', resumen: '', destacada: true, hidden: false, noticias: ['n1'],
    });
  });

  it('keeps a custom numeral and previews the automatic one', () => {
    expect(editionToForm({ ...stored, numeral: 'XX' }).numeral).toBe('XX');
    expect(numeralPreview({ ...emptyEditionForm(), numero: '9' })).toBe('IX');
    expect(numeralPreview({ ...emptyEditionForm(), numero: '9', numeral: 'x' })).toBe('X');
  });

  it('validates the edition before sending it', () => {
    expect(validateEditionForm(emptyEditionForm())).toHaveLength(2);
    const valid = { ...emptyEditionForm(SERIE), numero: '8' };
    expect(validateEditionForm(valid)).toEqual([]);
    expect(validateEditionForm({ ...valid, fechaFin: '2026-12-02T13:00' })).toEqual(['Para indicar el fin, indica también el inicio.']);
    expect(validateEditionForm({ ...valid, fechaInicio: '2026-12-02T13:00', fechaFin: '2026-12-02T09:00' })).toEqual(['El fin no puede ser antes del inicio.']);
    expect(validateEditionForm({ ...valid, semestre: '2026-3', url: 'jepa.pe', numeral: '8' })).toHaveLength(3);
  });
});
