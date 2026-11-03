import { describe, expect, it } from 'vitest';
import { emptyForm, formFromSlide, imageNotes, isSafeLink, previewLink, toPayload, validateForm } from './heroForm.js';

const adminSlide = (extra = {}) => ({
  _id: 's1',
  image: '/uploads/a.webp',
  imageMobile: '',
  alt: 'Fachada',
  title: 'Matrícula 2026',
  subtitle: '',
  ctaLabel: '',
  ctaUrl: '',
  notice: null,
  focusX: 50,
  focusY: 50,
  active: true,
  startAt: null,
  endAt: null,
  ...extra,
});

describe('hero slide form', () => {
  it('starts empty, active and centered', () => {
    expect(emptyForm()).toMatchObject({ image: '', linkType: 'none', focusX: 50, focusY: 50, active: true, startAt: '', endAt: '' });
  });

  it('reads a slide from the panel, picking the link type and showing dates in Lima time', () => {
    expect(formFromSlide(adminSlide()).linkType).toBe('none');
    expect(formFromSlide(adminSlide({ ctaUrl: 'https://example.com', ctaLabel: 'Ver' }))).toMatchObject({ linkType: 'url', ctaUrl: 'https://example.com', ctaLabel: 'Ver' });

    const linked = formFromSlide(adminSlide({
      notice: { _id: 'n1', title: 'Una noticia' },
      startAt: '2026-11-10T14:00:00.000Z',
      endAt: '2026-11-12T23:30:00.000Z',
      active: false,
    }));
    expect(linked).toMatchObject({ linkType: 'notice', notice: 'n1', startAt: '2026-11-10T09:00', endAt: '2026-11-12T18:30', active: false });
  });

  it('sends only the destination of the chosen button type and converts the dates to UTC', () => {
    const base = { ...emptyForm(), image: '/uploads/a.webp', alt: ' Fachada ', title: ' Hola ' };

    expect(toPayload(base)).toMatchObject({ alt: 'Fachada', title: 'Hola', ctaLabel: '', ctaUrl: '', notice: '', startAt: '', endAt: '' });
    expect(toPayload({ ...base, linkType: 'url', ctaLabel: ' Ver ', ctaUrl: ' https://example.com ', notice: 'n1' }))
      .toMatchObject({ ctaLabel: 'Ver', ctaUrl: 'https://example.com', notice: '' });
    expect(toPayload({ ...base, linkType: 'notice', ctaLabel: 'Leer', ctaUrl: 'https://example.com', notice: 'n1' }))
      .toMatchObject({ ctaLabel: 'Leer', ctaUrl: '', notice: 'n1' });
    expect(toPayload({ ...base, linkType: 'none', ctaLabel: 'Sobra', ctaUrl: 'https://example.com', notice: 'n1' }))
      .toMatchObject({ ctaLabel: '', ctaUrl: '', notice: '' });
    expect(toPayload({ ...base, startAt: '2026-11-10T09:00', endAt: '2026-11-10T21:00' }))
      .toMatchObject({ startAt: '2026-11-10T14:00:00.000Z', endAt: '2026-11-11T02:00:00.000Z' });
  });

  it('keeps what the panel sent when nothing was edited', () => {
    const slide = adminSlide({ notice: { _id: 'n1', title: 'X' }, ctaLabel: 'Leer', startAt: '2026-11-10T14:00:00.000Z' });
    expect(toPayload(formFromSlide(slide))).toMatchObject({
      image: '/uploads/a.webp', ctaLabel: 'Leer', notice: 'n1', ctaUrl: '', startAt: '2026-11-10T14:00:00.000Z', endAt: '',
    });
  });
});

describe('hero slide validation', () => {
  const valid = { ...emptyForm(), image: '/uploads/a.webp' };

  it('accepts a slide with only the image', () => {
    expect(validateForm(valid)).toEqual([]);
  });

  it('requires the main image', () => {
    expect(validateForm(emptyForm())).toEqual(['Elige la imagen principal.']);
  });

  it('requires a destination for the button', () => {
    expect(validateForm({ ...valid, linkType: 'notice' })).toEqual(['Elige la noticia a la que llevará el botón.']);
    expect(validateForm({ ...valid, linkType: 'notice', notice: 'n1' })).toEqual([]);
    expect(validateForm({ ...valid, linkType: 'url' })).toEqual(['Escribe la dirección a la que llevará el botón.']);
    expect(validateForm({ ...valid, linkType: 'url', ctaUrl: 'www.example.com' })[0]).toMatch(/debe empezar con https/);
    expect(validateForm({ ...valid, linkType: 'url', ctaUrl: 'javascript:alert(1)' })[0]).toMatch(/debe empezar con https/);
    expect(validateForm({ ...valid, linkType: 'url', ctaUrl: 'https://example.com/matricula' })).toEqual([]);
  });

  it('requires the end to come after the start', () => {
    const message = 'El fin de la programación debe ser posterior al inicio.';
    expect(validateForm({ ...valid, startAt: '2026-11-10T09:00', endAt: '2026-11-10T09:00' })).toEqual([message]);
    expect(validateForm({ ...valid, startAt: '2026-11-10T09:00', endAt: '2026-11-09T09:00' })).toEqual([message]);
    expect(validateForm({ ...valid, startAt: '2026-11-10T09:00', endAt: '2026-11-10T09:01' })).toEqual([]);
    expect(validateForm({ ...valid, endAt: '2026-11-10T09:00' })).toEqual([]);
  });

  it('accepts only the link schemes the server accepts', () => {
    expect(isSafeLink('https://example.com')).toBe(true);
    expect(isSafeLink('http://example.com')).toBe(true);
    expect(isSafeLink('mailto:facultad@undc.edu.pe')).toBe(true);
    expect(isSafeLink('javascript:alert(1)')).toBe(false);
    expect(isSafeLink('data:text/html,hola')).toBe(false);
    expect(isSafeLink('/noticias/1')).toBe(false);
    expect(isSafeLink('')).toBe(false);
  });
});

describe('image size notes', () => {
  it('warns about a small desktop image', () => {
    expect(imageNotes({ width: 1200, height: 500 })).toEqual([expect.stringContaining('1200 px de ancho')]);
    expect(imageNotes({ width: 1920, height: 800 })).toEqual([]);
    expect(imageNotes({ width: 1600, height: 700 })).toEqual([]);
  });

  it('warns about an image that is too tall for the carousel', () => {
    const notes = imageNotes({ width: 1800, height: 1500 });
    expect(notes).toEqual([expect.stringContaining('poco apaisada')]);
    expect(imageNotes({ width: 1000, height: 1000 })).toHaveLength(2);
  });

  it('uses lower limits for the mobile image and ignores its shape', () => {
    expect(imageNotes({ width: 1080, height: 1080 }, 'mobile')).toEqual([]);
    expect(imageNotes({ width: 600, height: 600 }, 'mobile')).toEqual([expect.stringContaining('al menos 1080 px')]);
  });

  it('says nothing while the size is unknown', () => {
    expect(imageNotes(null)).toEqual([]);
    expect(imageNotes({})).toEqual([]);
  });
});

describe('button preview', () => {
  it('has no button without a destination', () => {
    expect(previewLink(emptyForm())).toBeNull();
  });

  it('uses the typed text or the default one', () => {
    expect(previewLink({ ...emptyForm(), linkType: 'notice' })).toEqual({ label: 'Leer noticia', url: '#', internal: true });
    expect(previewLink({ ...emptyForm(), linkType: 'url' })).toEqual({ label: 'Más información', url: '#', internal: false });
    expect(previewLink({ ...emptyForm(), linkType: 'url', ctaLabel: ' Matricúlate ' })).toMatchObject({ label: 'Matricúlate' });
  });
});
