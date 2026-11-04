import { describe, expect, it } from 'vitest';
import { cleanBlocks, emptyForm, findFilterTrap, formFromNotice, isEmptyBlock, toApiPayload, toPreviewBlocks, validateForm } from './noticeForm.js';

const text = (html, id = 'text0001') => ({ id, type: 'text', html });
const withForm = (changes) => ({ ...emptyForm(), title: 'Título', ...changes });

describe('formFromNotice', () => {
  it('turns the body of an old notice into text blocks so it is not lost on save', () => {
    const form = formFromNotice({
      title: 'Antigua', description: 'Primera línea\r\nSegunda línea', content: [], status: 'published',
      date: '2026-04-17T00:00:00.000Z', updatedAt: '2026-04-18T10:00:00.000Z',
    });
    expect(form.blocks.map((block) => block.html)).toEqual(['<p>Primera línea</p>', '<p>Segunda línea</p>']);
    expect(form.summary).toBe('');
    expect(form.displayDate).toBe('2026-04-17');
    expect(form.baseUpdatedAt).toBe('2026-04-18T10:00:00.000Z');
  });

  it('keeps blocks and summary of a notice made with the editor', () => {
    const blocks = [text('<p>Hola</p>')];
    const form = formFromNotice({ title: 'Nueva', description: 'Resumen', content: blocks, status: 'published', featured: true });
    expect(form.blocks).toBe(blocks);
    expect(form.summary).toBe('Resumen');
    expect(form.featured).toBe(true);
  });

  it('detects the publication mode and shows the schedule in Lima time', () => {
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    future.setUTCHours(14, 0, 0, 0);
    const scheduled = formFromNotice({ title: 'x', description: 'y', status: 'scheduled', publishAt: future.toISOString() });
    expect(scheduled.mode).toBe('scheduled');
    expect(scheduled.publishAtLocal).toMatch(/T09:00$/);

    expect(formFromNotice({ title: 'x', description: 'y', status: 'hidden', hidden: true }).mode).toBe('hidden');
    expect(formFromNotice({ title: 'x', description: 'y', status: 'published' }).mode).toBe('published');
  });

  it('keeps the category id and the cover', () => {
    const form = formFromNotice({
      title: 'x', description: 'y', category: { _id: 'abc', name: 'Avisos', slug: 'avisos' }, imageUrl: '/uploads/a.png'
    });
    expect(form.categoryId).toBe('abc');
    expect(form.coverUrl).toBe('/uploads/a.png');
    expect(form.coverChanged).toBe(false);
  });
});

describe('blocks to send', () => {
  it('drops blocks that were added but never filled in', () => {
    const blocks = [
      text('<p></p>', 'empty001'),
      text('<p>Con texto</p>', 'text0002'),
      { id: 'image001', type: 'image', url: '' },
      { id: 'gallery1', type: 'gallery', layout: 'grid', images: [] },
      { id: 'video001', type: 'video', url: '   ', caption: '' },
      { id: 'button01', type: 'button', label: '', url: '', style: 'primary' },
      { id: 'divider1', type: 'divider' },
    ];
    expect(blocks.map(isEmptyBlock)).toEqual([true, false, true, true, true, true, false]);
    expect(cleanBlocks(blocks).map((block) => block.id)).toEqual(['text0002', 'divider1']);
  });

  it('sends only the fields the server accepts', () => {
    const [video, gallery, image] = cleanBlocks([
      { id: 'video001', type: 'video', url: ' https://youtu.be/dQw4w9WgXcQ ', caption: 'Charla', provider: 'youtube', videoId: 'dQw4w9WgXcQ', hash: undefined },
      { id: 'gallery1', type: 'gallery', layout: 'grid', images: [{ url: '/uploads/a.webp', alt: 'A', thumbUrl: '/uploads/a-480.webp', key: 3 }] },
      { id: 'image001', type: 'image', url: '/uploads/b.webp', uploading: false },
    ]);
    expect(video).toEqual({ id: 'video001', type: 'video', url: 'https://youtu.be/dQw4w9WgXcQ', caption: 'Charla' });
    expect(gallery.images).toEqual([{ url: '/uploads/a.webp', alt: 'A', caption: '' }]);
    expect(image).toEqual({ id: 'image001', type: 'image', url: '/uploads/b.webp', alt: '', caption: '', width: 'normal' });
  });
});

describe('toPreviewBlocks', () => {
  it('resolves videos like the server does and skips empty blocks', () => {
    const blocks = toPreviewBlocks([
      text('<p></p>', 'empty001'),
      { id: 'video001', type: 'video', url: 'https://youtu.be/dQw4w9WgXcQ', caption: 'Charla' },
      { id: 'divider1', type: 'divider' },
    ]);
    expect(blocks).toEqual([
      { id: 'video001', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', caption: 'Charla', provider: 'youtube', videoId: 'dQw4w9WgXcQ' },
      { id: 'divider1', type: 'divider' },
    ]);
  });
});

describe('validateForm', () => {
  it('accepts a notice with only a title and blocks', () => {
    expect(validateForm(withForm({ blocks: [text('<p>Hola</p>')] }))).toEqual([]);
    expect(validateForm(withForm({}))).toEqual([]);
  });

  it('asks for the required data', () => {
    expect(validateForm(withForm({ title: '  ' }))).toEqual(['El título es obligatorio.']);
    expect(validateForm(withForm({ mode: 'scheduled' }))).toEqual(['Elige la fecha y la hora en que se publicará.']);
    expect(validateForm(withForm({ displayDate: '' }))).toEqual(['Elige la fecha que se mostrará en la noticia.']);
    expect(validateForm(withForm({ summary: 'a'.repeat(301) }))[0]).toMatch(/300 caracteres/);
  });

  it('counts the summary by characters, not by UTF-16 units', () => {
    expect(validateForm(withForm({ summary: '😀'.repeat(300) }))).toEqual([]);
  });

  it('reports invalid blocks by their position in the editor', () => {
    const errors = validateForm(withForm({
      blocks: [
        text('<p></p>', 'empty001'),
        { id: 'video001', type: 'video', url: 'https://evil.example/watch?v=1', caption: '' },
        { id: 'button01', type: 'button', label: '', url: 'javascript:alert(1)', style: 'primary' },
        { id: 'button02', type: 'button', label: 'Ir', url: 'https://ok.example', style: 'primary' },
      ],
    }));
    expect(errors).toEqual([
      'Bloque 2 (video): el enlace debe ser de YouTube, Vimeo o Facebook.',
      'Bloque 3 (botón): escribe el texto del botón.',
      'Bloque 3 (botón): el enlace debe empezar con https://, http:// o mailto:.',
    ]);
  });
});

describe('findFilterTrap', () => {
  it('finds a « followed by a word the server filter takes for an HTML tag', () => {
    expect(findFilterTrap('Ponencia «Image Captioning con Vision Transformers»')).toBe('«Image');
    expect(findFilterTrap('<em>«VIDEO en vivo»</em>')).toBe('«VIDEO');
    expect(findFilterTrap('«Set de datos»')).toBe('«Set');
    expect(findFilterTrap('« Link »')).toBe('« Link');
    expect(findFilterTrap('‹Script›')).toBe('‹Script');
  });

  it('finds the words that fail even when they go on, such as Formación', () => {
    expect(findFilterTrap('«Formación continua»')).toBe('«Formación');
    expect(findFilterTrap('Los «Formadores»')).toBe('«Formadores');
    expect(findFilterTrap('«Styles»')).toBe('«Styles');
  });

  it('lets through what the filter accepts', () => {
    for (const text of [
      '«Imagen digital»', '«Imágenes»', '«Images»', '«Videos»', '«Body»', '«Ciberseguridad 2030»', '«Selección de datos»',
      '«Linkedin»', '«Baseball»', '«Setting»', '«Metadatos»', '“Image Captioning”', '"Formación continua"', 'Formación', '', undefined,
    ]) {
      expect(findFilterTrap(text)).toBeNull();
    }
  });
});

describe('validateForm and the server filter', () => {
  it('tells where a « followed by a risky word is, in titles, texts and captions', () => {
    const errors = validateForm(withForm({
      title: 'Charla «Video en vivo»',
      blocks: [
        text('<p>Ponencia <em>«Image Captioning con Vision Transformers e IA multimodal»</em>.</p>'),
        text('<p>«Imagen digital», «Body», “Image Captioning” y « Image» pasan.</p>', 'text0002'),
        { id: 'gallery1', type: 'gallery', layout: 'grid', images: [{ url: '/uploads/a.webp', alt: '', caption: 'Foto «Form' }] },
      ],
    }));
    const hint = '(su filtro confunde la comilla « con una etiqueta HTML). Cambia « » por “ ” en ese texto.';
    expect(errors).toEqual([
      `El título: el servidor rechaza «Video… ${hint}`,
      `Bloque 1 (texto): el servidor rechaza «Image… ${hint}`,
      `Bloque 3 (galería): el servidor rechaza «Form… ${hint}`,
    ]);
  });

  it('does not warn about the unfilled blocks nor about a clean notice', () => {
    expect(validateForm(withForm({ blocks: [text('<p></p>', 'empty001'), text('<p>«Ciberseguridad»</p>')] }))).toEqual([]);
  });
});

describe('toApiPayload', () => {
  it('builds a published notice with the displayed date at midnight UTC', () => {
    const payload = toApiPayload(withForm({
      title: '  Título  ', summary: ' Resumen ', displayDate: '2026-11-03', categoryId: 'abc', byline: ' Decanato ',
      blocks: [text('<p>Hola</p>')], featured: true,
    }), { isEdit: false });
    expect(payload).toEqual({
      title: 'Título',
      description: 'Resumen',
      content: [{ id: 'text0001', type: 'text', html: '<p>Hola</p>' }],
      hidden: false,
      featured: true,
      category: 'abc',
      byline: 'Decanato',
      imageAlt: '',
      publishAt: '',
      date: '2026-11-03T00:00:00Z',
    });
  });

  it('schedules in Lima time and lets the server derive the displayed date', () => {
    const payload = toApiPayload(withForm({ mode: 'scheduled', publishAtLocal: '2026-11-10T21:00' }), { isEdit: false });
    expect(payload.publishAt).toBe('2026-11-11T02:00:00.000Z');
    expect(payload).not.toHaveProperty('date');
    expect(payload.hidden).toBe(false);
  });

  it('marks hidden notices and clears any schedule', () => {
    const payload = toApiPayload(withForm({ mode: 'hidden', publishAtLocal: '2026-11-10T09:00' }), { isEdit: false });
    expect(payload).toMatchObject({ hidden: true, publishAt: '' });
  });

  it('omits an empty summary so the server derives it, and sends the cover only when it changed', () => {
    const untouched = toApiPayload(withForm({ coverUrl: '/uploads/old.png' }), { isEdit: true });
    expect(untouched).not.toHaveProperty('description');
    expect(untouched).not.toHaveProperty('imageUrl');

    expect(toApiPayload(withForm({ coverUrl: '/uploads/new.webp', coverChanged: true }), { isEdit: true }).imageUrl).toBe('/uploads/new.webp');
    expect(toApiPayload(withForm({ coverUrl: '', coverChanged: true }), { isEdit: true }).imageUrl).toBe('');
  });

  it('sends the version the editor loaded only when editing', () => {
    const form = withForm({ baseUpdatedAt: '2026-11-03T15:00:00.000Z' });
    expect(toApiPayload(form, { isEdit: true }).baseUpdatedAt).toBe('2026-11-03T15:00:00.000Z');
    expect(toApiPayload(form, { isEdit: false })).not.toHaveProperty('baseUpdatedAt');
  });
});
