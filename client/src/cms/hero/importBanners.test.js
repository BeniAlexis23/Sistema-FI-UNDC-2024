import { describe, expect, it, vi } from 'vitest';
import { importBanners } from './importBanners.js';

const banners = [1, 2, 3].map((n) => ({ id: `banner-${n}`, alt: `Banner institucional ${n}`, image: `/assets/banner${n}.webp` }));

const makeDeps = (overrides = {}) => {
  const calls = [];
  return {
    calls,
    loadFile: vi.fn(async (banner) => ({ name: banner.id })),
    upload: vi.fn(async (file) => ({ url: `/uploads/${file.name}.webp` })),
    create: vi.fn(async (data) => {
      calls.push(`create ${data.image}`);
      return { _id: `slide-${calls.length}`, ...data };
    }),
    remove: vi.fn(async () => {}),
    ...overrides,
  };
};

describe('importing the bundled banners', () => {
  it('uploads every banner first and then creates the slides in order', async () => {
    const deps = makeDeps();
    const created = await importBanners(banners, deps);

    expect(created.map((slide) => slide.alt)).toEqual(['Banner institucional 1', 'Banner institucional 2', 'Banner institucional 3']);
    expect(deps.upload).toHaveBeenCalledTimes(3);
    expect(deps.calls).toEqual(['create /uploads/banner-1.webp', 'create /uploads/banner-2.webp', 'create /uploads/banner-3.webp']);
    expect(deps.upload.mock.invocationCallOrder.at(-1)).toBeLessThan(deps.create.mock.invocationCallOrder[0]);
    expect(deps.remove).not.toHaveBeenCalled();
  });

  it('reports the progress', async () => {
    const onProgress = vi.fn();
    await importBanners(banners, makeDeps({ onProgress }));
    expect(onProgress.mock.calls).toEqual([[0, 3], [1, 3], [2, 3], [3, 3]]);
  });

  it('creates nothing when an upload fails', async () => {
    const deps = makeDeps({
      upload: vi.fn(async (file) => {
        if (file.name === 'banner-2') throw new Error('no se pudo subir');
        return { url: `/uploads/${file.name}.webp` };
      }),
    });

    await expect(importBanners(banners, deps)).rejects.toThrow('no se pudo subir');
    expect(deps.create).not.toHaveBeenCalled();
  });

  it('creates nothing when a banner cannot be read', async () => {
    const deps = makeDeps({ loadFile: vi.fn(async () => { throw new Error('sin archivo'); }) });
    await expect(importBanners(banners, deps)).rejects.toThrow('sin archivo');
    expect(deps.upload).not.toHaveBeenCalled();
    expect(deps.create).not.toHaveBeenCalled();
  });

  it('removes the slides it already created when a later one fails', async () => {
    let attempts = 0;
    const deps = makeDeps({
      create: vi.fn(async (data) => {
        attempts += 1;
        if (attempts === 3) throw new Error('falló la tercera');
        return { _id: `slide-${attempts}`, ...data };
      }),
    });

    await expect(importBanners(banners, deps)).rejects.toThrow('falló la tercera');
    expect(deps.remove.mock.calls).toEqual([['slide-1'], ['slide-2']]);
  });

  it('still reports the original error if cleaning up also fails', async () => {
    let attempts = 0;
    const deps = makeDeps({
      create: vi.fn(async (data) => {
        attempts += 1;
        if (attempts === 2) throw new Error('falló la segunda');
        return { _id: `slide-${attempts}`, ...data };
      }),
      remove: vi.fn(async () => { throw new Error('tampoco se pudo borrar'); }),
    });

    await expect(importBanners(banners, deps)).rejects.toThrow('falló la segunda');
  });
});
