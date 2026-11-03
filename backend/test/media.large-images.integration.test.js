import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readdir, readFile } from 'fs/promises';
import { crc32 } from 'zlib';
import sharp from 'sharp';
import path from 'path';
import { createUsers, loginAgent, makeImage, startTestApp } from './helpers.js';

const MEGABYTE = 1024 * 1024;

let ctx;
let adminAgent;

const send = (buffer, { filename = 'photo.jpg', contentType = 'image/jpeg' } = {}) => adminAgent.post('/api/media')
    .attach('file', buffer, { filename, contentType });

beforeAll(async () => {
    ctx = await startTestApp({ maxUploadMb: '25' });
    const [admin] = await createUsers(ctx.User);
    adminAgent = await loginAgent(ctx.app, admin.email);
});

afterAll(() => ctx.stop());

describe('large photo uploads', () => {
    it('accepts a photo above 5 MB and stores a smaller WebP within the size limit', async () => {
        // el ruido casi no se comprime: equivale a una foto muy detallada de celular o cámara
        const photo = await sharp({
            create: { width: 3000, height: 2000, channels: 3, noise: { type: 'gaussian', mean: 128, sigma: 50 } }
        }).jpeg({ quality: 95 }).toBuffer();
        expect(photo.length).toBeGreaterThan(5 * MEGABYTE);

        const response = await send(photo);
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({ width: 2560, height: 1707 });

        const stored = await readFile(path.join(ctx.uploadDirectory, path.basename(response.body.url)));
        expect(stored.length).toBeLessThan(photo.length);
        expect(await sharp(stored).metadata()).toMatchObject({ format: 'webp', width: 2560 });
    });

    it('accepts a 48 MP photo, which the previous 40 MP limit rejected', async () => {
        const response = await send(await makeImage({ format: 'jpeg', width: 8000, height: 6000 }));
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({ width: 2560, height: 1920 });
    });

    it('rejects an image that declares more pixels than the limit without decoding it', async () => {
        const png = Buffer.from(await makeImage());
        // IHDR: ancho en los bytes 16-19, alto en 20-23 y CRC (de tipo + datos) en 29-32
        png.writeUInt32BE(20000, 16);
        png.writeUInt32BE(20000, 20);
        png.writeUInt32BE(crc32(png.subarray(12, 29)), 29);

        const { processImage, MAX_INPUT_PIXELS } = await import('../src/multer.js');
        expect(20000 * 20000).toBeGreaterThan(MAX_INPUT_PIXELS);
        await expect(processImage(png)).rejects.toThrow(/pixel limit/);

        const before = await readdir(ctx.uploadDirectory);
        const response = await send(png, { filename: 'bomb.png', contentType: 'image/png' });
        expect(response.status).toBe(415);
        expect(await readdir(ctx.uploadDirectory)).toEqual(before);
    });
});
