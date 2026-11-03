import { describe, expect, it, vi } from 'vitest';
import { MAX_EDGE, PREPARED_TARGET_BYTES, SKIP_PREPARATION_BYTES, outputName, planSize, prepareImageForUpload } from './imagePrep.js';

const MB = 1024 * 1024;
const photo = (name, type, megabytes) => new File([new Uint8Array(Math.round(megabytes * MB))], name, { type, lastModified: 1_700_000_000_000 });

/* Motor de mentira: `sizes` son los pesos (en MB) que devuelve cada intento de codificar; null simula un formato no soportado */
const fakeEngine = ({ width = 6000, height = 4000, sizes = [1] } = {}) => {
  const renders = [];
  const release = vi.fn();
  const engine = {
    load: vi.fn(async () => ({
      width,
      height,
      release,
      render: async (targetWidth, targetHeight, type, quality) => {
        renders.push({ width: targetWidth, height: targetHeight, type, quality });
        const size = sizes[Math.min(renders.length - 1, sizes.length - 1)];
        return size === null ? null : new Blob([new Uint8Array(Math.round(size * MB))], { type });
      },
    })),
  };
  return { engine, renders, release };
};

describe('planSize', () => {
  it('fits the longest side without enlarging', () => {
    expect(planSize(6000, 4000, MAX_EDGE)).toEqual({ width: 2560, height: 1707 });
    expect(planSize(4000, 6000, MAX_EDGE)).toEqual({ width: 1707, height: 2560 });
    expect(planSize(2000, 1000, MAX_EDGE)).toEqual({ width: 2000, height: 1000 });
    expect(planSize(2560, 2560, MAX_EDGE)).toEqual({ width: 2560, height: 2560 });
  });

  it('never returns an empty side', () => {
    expect(planSize(30000, 1, MAX_EDGE)).toEqual({ width: 2560, height: 1 });
  });
});

describe('outputName', () => {
  it('swaps the extension for the one of the new format', () => {
    expect(outputName('IMG_3290.JPG', 'image/jpeg')).toBe('IMG_3290.jpg');
    expect(outputName('captura.png', 'image/webp')).toBe('captura.webp');
    expect(outputName('foto.final.v2.jpeg', 'image/jpeg')).toBe('foto.final.v2.jpg');
    expect(outputName('sin-extension', 'image/jpeg')).toBe('sin-extension.jpg');
    expect(outputName('.oculto', 'image/jpeg')).toBe('foto.jpg');
  });
});

describe('prepareImageForUpload', () => {
  it('uploads light photos as they are, without even decoding them', async () => {
    const { engine } = fakeEngine();
    const light = photo('IMG_1.JPG', 'image/jpeg', SKIP_PREPARATION_BYTES / MB);

    expect(await prepareImageForUpload(light, engine)).toBe(light);
    expect(engine.load).not.toHaveBeenCalled();
  });

  it('shrinks a camera photo to a 2560 px JPEG with a single encoding', async () => {
    const { engine, renders, release } = fakeEngine({ sizes: [1.2] });
    const original = photo('IMG_3290.JPG', 'image/jpeg', 12);

    const prepared = await prepareImageForUpload(original, engine);

    expect(renders).toEqual([{ width: 2560, height: 1707, type: 'image/jpeg', quality: 0.9 }]);
    expect(prepared).not.toBe(original);
    expect(prepared).toMatchObject({ name: 'IMG_3290.jpg', type: 'image/jpeg', lastModified: 1_700_000_000_000 });
    expect(prepared.size).toBe(Math.round(1.2 * MB));
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('lowers the quality until the result fits the target', async () => {
    const { engine, renders } = fakeEngine({ sizes: [5, 4, 2] });
    const prepared = await prepareImageForUpload(photo('a.jpg', 'image/jpeg', 14), engine);

    expect(renders.map((render) => render.quality)).toEqual([0.9, 0.82, 0.74]);
    expect(prepared.size).toBe(2 * MB);
  });

  it('shrinks the image itself when quality is not enough', async () => {
    const { engine, renders } = fakeEngine({ sizes: [6, 6, 6, 6, 2.4] });
    const prepared = await prepareImageForUpload(photo('a.jpg', 'image/jpeg', 20), engine);

    expect(renders).toHaveLength(5);
    expect(Math.max(renders[4].width, renders[4].height)).toBe(2048);
    expect(prepared.size).toBe(Math.round(2.4 * MB));
  });

  it('keeps the smallest result when none reaches the target but it still beats the original', async () => {
    const { engine, renders } = fakeEngine({ sizes: [9, 8, 7, 6, 5, 4] });
    const prepared = await prepareImageForUpload(photo('a.jpg', 'image/jpeg', 12), engine);

    expect(renders).toHaveLength(6);
    expect(prepared.size).toBe(4 * MB);
    expect(PREPARED_TARGET_BYTES).toBeLessThan(prepared.size);
  });

  it('never replaces the photo with a heavier one', async () => {
    const { engine } = fakeEngine({ sizes: [7] });
    const original = photo('a.jpg', 'image/jpeg', 4.5);

    expect(await prepareImageForUpload(original, engine)).toBe(original);
  });

  it('re-encodes PNG and WebP as WebP so transparency survives', async () => {
    const { engine, renders } = fakeEngine({ width: 3000, height: 2000, sizes: [0.9] });
    const prepared = await prepareImageForUpload(photo('captura.png', 'image/png', 8), engine);

    expect(renders[0]).toMatchObject({ type: 'image/webp', width: 2560, height: 1707 });
    expect(prepared).toMatchObject({ name: 'captura.webp', type: 'image/webp' });
  });

  it('uploads the original when the browser cannot encode the format', async () => {
    const { engine, release } = fakeEngine({ sizes: [null] });
    const original = photo('captura.png', 'image/png', 8);

    expect(await prepareImageForUpload(original, engine)).toBe(original);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('uploads the original when the image cannot be read', async () => {
    const engine = { load: vi.fn(async () => { throw new Error('imagen dañada'); }) };
    const original = photo('rota.jpg', 'image/jpeg', 9);

    expect(await prepareImageForUpload(original, engine)).toBe(original);
  });

  it('uploads the original when encoding fails halfway', async () => {
    const release = vi.fn();
    const engine = { load: async () => ({ width: 6000, height: 4000, release, render: async () => { throw new Error('sin memoria'); } }) };
    const original = photo('grande.jpg', 'image/jpeg', 20);

    expect(await prepareImageForUpload(original, engine)).toBe(original);
    expect(release).toHaveBeenCalledTimes(1);
  });
});
