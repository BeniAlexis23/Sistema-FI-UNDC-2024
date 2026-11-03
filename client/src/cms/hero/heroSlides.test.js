import { describe, expect, it } from 'vitest';
import { buildHeroState } from './heroSlides.js';

const fallback = { source: 'fallback', slides: [{ id: 'banner-1', image: '/assets/banner1.webp' }], intervalSeconds: 5 };
const resolveUrl = (path) => `https://cdn.test${path}`;
const build = (data) => buildHeroState(data, { fallback, resolveUrl });

describe('public hero state', () => {
  it('uses the bundled banners when there is nothing to show', () => {
    expect(build({ intervalSeconds: 8, slides: [] })).toBe(fallback);
    expect(build({})).toBe(fallback);
    expect(build(null)).toBe(fallback);
    expect(build({ slides: 'no es una lista' })).toBe(fallback);
  });

  it('resolves the image URLs and keeps the rest of each slide', () => {
    const state = build({
      intervalSeconds: 8,
      slides: [
        { id: 'a', image: '/uploads/a.webp', imageMobile: '/uploads/a-m.webp', title: 'Hola', link: { label: 'Ver', url: '/noticias/1', internal: true } },
        { id: 'b', image: '/uploads/b.webp', imageMobile: null, title: '', link: null },
      ],
    });

    expect(state).toEqual({
      source: 'api',
      intervalSeconds: 8,
      slides: [
        { id: 'a', image: 'https://cdn.test/uploads/a.webp', imageMobile: 'https://cdn.test/uploads/a-m.webp', title: 'Hola', link: { label: 'Ver', url: '/noticias/1', internal: true } },
        { id: 'b', image: 'https://cdn.test/uploads/b.webp', imageMobile: null, title: '', link: null },
      ],
    });
  });

  it('keeps the default interval when the API sends an unusable one', () => {
    const slides = [{ id: 'a', image: '/uploads/a.webp' }];
    expect(build({ slides }).intervalSeconds).toBe(5);
    expect(build({ slides, intervalSeconds: 0 }).intervalSeconds).toBe(5);
    expect(build({ slides, intervalSeconds: 'x' }).intervalSeconds).toBe(5);
    expect(build({ slides, intervalSeconds: '12' }).intervalSeconds).toBe(12);
  });
});
