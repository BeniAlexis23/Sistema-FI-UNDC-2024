import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import sharp from 'sharp';
import path from 'path';
import request from 'supertest';
import { createUsers, fileExists, loginAgent, makeImage, startTestApp, uploadImage } from './helpers.js';

let ctx;
let app;
let Notice;
let admin;
let editor;
let adminAgent;

const textBlock = (html, id = 'text0001') => ({ id, type: 'text', html });
const dividerBlock = (id = 'divider1') => ({ id, type: 'divider' });
const imageBlock = (url, id = 'image001') => ({ id, type: 'image', url, alt: 'Foto', width: 'normal' });
const galleryBlock = (urls, id = 'gallery1') => ({ id, type: 'gallery', layout: 'grid', images: urls.map((url) => ({ url })) });

const createWithContent = (content, extra = {}) => adminAgent.post('/api/notices').send({ title: 'Con bloques', content, ...extra });
const storedContent = async (response) => (await Notice.findById(response.body._id).lean()).content;
const exists = (url) => fileExists(ctx.uploadDirectory, url);
const thumbOf = (url) => url.replace(/\.webp$/, '-480.webp');

beforeAll(async () => {
    ctx = await startTestApp();
    ({ app, Notice } = ctx);
});

beforeEach(async () => {
    await Promise.all([ctx.User.deleteMany({}), Notice.deleteMany({}), ctx.Category.deleteMany({})]);
    [admin, editor] = await createUsers(ctx.User);
    adminAgent = await loginAgent(app, admin.email);
});

afterAll(() => ctx.stop());

describe('media uploads', () => {
    it('stores a resized WebP with a thumbnail and strips the metadata', async () => {
        const upload = await uploadImage(adminAgent, {
            format: 'jpeg', width: 3000, height: 2000, exif: { IFD0: { Copyright: 'dato privado' } }
        });

        expect(upload.url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.webp$/);
        expect(upload.thumbUrl).toBe(thumbOf(upload.url));
        expect(upload).toMatchObject({ width: 2000, height: 1333 });

        const main = await sharp(path.join(ctx.uploadDirectory, path.basename(upload.url))).metadata();
        expect(main).toMatchObject({ format: 'webp', width: 2000 });
        expect(main.exif).toBeUndefined();
        const thumb = await sharp(path.join(ctx.uploadDirectory, path.basename(upload.thumbUrl))).metadata();
        expect(thumb.width).toBe(480);
    });

    it('does not enlarge small images', async () => {
        const upload = await uploadImage(adminAgent, { width: 100, height: 50 });
        expect(upload).toMatchObject({ width: 100, height: 50 });
    });

    it('rejects anonymous, spoofed, corrupt, empty and oversized uploads', async () => {
        const png = await makeImage();
        const send = (agent, buffer, contentType = 'image/png') => agent.post('/api/media')
            .attach('file', buffer, { filename: 'photo', contentType });

        expect((await send(request(app), png)).status).toBe(401);
        expect((await send(adminAgent, png, 'image/jpeg')).status).toBe(415);

        // firma PNG correcta pero contenido inservible
        const corrupt = Buffer.concat([png.subarray(0, 40), Buffer.from('x'.repeat(200))]);
        const corruptResponse = await send(adminAgent, corrupt);
        expect(corruptResponse.status).toBe(415);

        expect((await send(adminAgent, Buffer.alloc(100))).status).toBe(415);
        expect((await send(adminAgent, Buffer.concat([png, Buffer.alloc(1024 * 1024)]))).status).toBe(413);
        expect((await adminAgent.post('/api/media').field('note', 'sin archivo')).status).toBe(400);
    });

    it('answers 413 when a text field is larger than allowed', async () => {
        const response = await adminAgent.post('/api/notices')
            .field('title', 'Huge').field('description', 'x'.repeat(600 * 1024));
        expect(response.status).toBe(413);
    });
});

describe('content blocks', () => {
    it('stores a complete article, normalizes it and exposes it in the public detail only', async () => {
        const [cover, photo, first, second] = [
            await uploadImage(adminAgent), await uploadImage(adminAgent), await uploadImage(adminAgent), await uploadImage(adminAgent)
        ];
        const content = [
            textBlock('<h2>Título</h2><p>Primer párrafo con emoji 🎓 y <strong>negrita</strong>.</p>'),
            { id: 'image001', type: 'image', url: photo.url, alt: 'Foto', caption: 'Pie de foto', width: 'wide' },
            { id: 'gallery1', type: 'gallery', layout: 'carousel', images: [{ url: first.url, alt: 'Uno' }, { url: second.url }] },
            { id: 'video001', type: 'video', url: 'https://youtu.be/dQw4w9WgXcQ?t=10', caption: 'Charla' },
            { id: 'callout1', type: 'callout', variant: 'info', html: '<p>Aviso importante</p>' },
            { id: 'button01', type: 'button', label: 'Inscríbete', url: 'https://curso.example/' },
            dividerBlock()
        ];

        const response = await createWithContent(content, { imageUrl: cover.url });
        expect(response.status).toBe(200);

        const stored = await Notice.findById(response.body._id).lean();
        expect(stored.content.map((block) => block.type)).toEqual(['text', 'image', 'gallery', 'video', 'callout', 'button', 'divider']);
        expect(stored.content[1]).toMatchObject({ width: 'wide', caption: 'Pie de foto' });
        expect(stored.content[3]).toEqual({
            id: 'video001', type: 'video', provider: 'youtube', videoId: 'dQw4w9WgXcQ',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', caption: 'Charla'
        });
        expect(stored.content[5]).toMatchObject({ style: 'primary' });
        expect(stored.description).toBe('Título Primer párrafo con emoji 🎓 y negrita.');
        expect(stored.readingMinutes).toBe(1);
        expect([...stored.mediaRefs].sort()).toEqual([cover.url, photo.url, first.url, second.url].sort());

        const detail = await request(app).get(`/api/noticias/${response.body._id}`);
        expect(detail.body.content).toHaveLength(7);
        expect(detail.body.content[3]).toMatchObject({ provider: 'youtube', videoId: 'dQw4w9WgXcQ' });
        const list = await request(app).get('/api/noticias');
        expect(list.body[0]).not.toHaveProperty('content');
        expect(list.body[0].readingMinutes).toBe(1);
    });

    it('sanitizes the HTML of text and callout blocks', async () => {
        const dirty = [
            '<p onclick="steal()">hola</p>',
            '<script>alert(1)</script>',
            '<img src=x onerror=alert(1)>',
            '<a href="javascript:alert(1)">malo</a>',
            '<a href="java&#x0A;script:alert(1)">malo2</a>',
            '<a href="//evil.example/x">malo3</a>',
            '<iframe src="https://evil.example"></iframe>',
            '<svg onload=alert(1)></svg>',
            '<h1>Título</h1>',
            '<p style="color:red" class="x">con estilo</p>',
            '<a href="https://ok.example/x" onclick="x()">bueno</a>'
        ].join('');

        const response = await createWithContent([
            textBlock(dirty),
            { id: 'callout1', type: 'callout', variant: 'warning', html: '<p>Aviso</p><script>alert(2)</script>' }
        ]);
        expect(response.status).toBe(200);

        const [text, callout] = await storedContent(response);
        for (const forbidden of ['script', 'onerror', 'onclick', 'javascript', 'iframe', 'svg', 'style', 'class=', 'evil.example/x', '<img', '<h1']) {
            expect(text.html).not.toContain(forbidden);
        }
        expect(text.html).toContain('<h2>Título</h2>');
        expect(text.html).toContain('<a href="https://ok.example/x" target="_blank" rel="noopener noreferrer">bueno</a>');
        expect(callout.html).toBe('<p>Aviso</p>');
    });

    it('drops text blocks that end up empty', async () => {
        const response = await createWithContent([textBlock('<p></p>'), textBlock('<script>x</script>', 'text0002'), dividerBlock()]);
        expect(response.status).toBe(200);
        expect((await storedContent(response)).map((block) => block.type)).toEqual(['divider']);
    });

    it('rejects malformed structures', async () => {
        const manyBlocks = (count) => Array.from({ length: count }, (_, index) => dividerBlock(`divider${String(index).padStart(3, '0')}`));
        const bigText = (index) => textBlock('a'.repeat(19000), `text${String(index).padStart(4, '0')}`);
        const cases = {
            'unknown type': [{ id: 'script01', type: 'script', src: 'x' }],
            'extra keys': [{ id: 'divider1', type: 'divider', extra: true }],
            'missing id': [{ type: 'divider' }],
            'invalid id': [{ id: 'a b', type: 'divider' }],
            'not a list': { id: 'divider1', type: 'divider' },
            'too many blocks': manyBlocks(61),
            'empty gallery': [galleryBlock([])],
            'duplicated ids': [dividerBlock('same0001'), dividerBlock('same0001')],
            'beyond 400 KB': Array.from({ length: 22 }, (_, index) => bigText(index)),
            'operator objects': [{ id: 'divider1', type: { $gt: '' } }]
        };

        for (const [label, content] of Object.entries(cases)) {
            const response = await createWithContent(content);
            expect(response.status, label).toBe(400);
        }
        expect(await Notice.countDocuments()).toBe(0);
    });

    it('rejects a gallery with more than 30 images before validating each one', async () => {
        const upload = await uploadImage(adminAgent);
        const response = await createWithContent([galleryBlock(Array.from({ length: 31 }, () => upload.url))]);
        expect(response.status).toBe(400);
    });

    it('keeps polluted keys out of the stored content', async () => {
        const raw = '{"title":"x","content":[{"id":"divider1","type":"divider","__proto__":{"polluted":true}}]}';
        const response = await adminAgent.post('/api/notices').set('Content-Type', 'application/json').send(raw);
        expect(response.status).toBe(400);
        expect({}.polluted).toBeUndefined();
    });

    it('accepts only uploads made through the media endpoint', async () => {
        const upload = await uploadImage(adminAgent);
        const invalidUrls = [
            'https://evil.example/photo.png',
            '/uploads/../secret.png',
            '/uploads/photo.svg',
            '/uploads/not-a-uuid.webp',
            `${upload.url}?x=1`,
            `/other${upload.url}`
        ];
        for (const url of invalidUrls) {
            expect((await createWithContent([imageBlock(url)])).status, url).toBe(400);
        }

        const missing = await createWithContent([imageBlock('/uploads/00000000-0000-4000-8000-000000000000.webp')]);
        expect(missing.status).toBe(400);
        expect(missing.body).toEqual(['Image not found']);
        expect((await createWithContent([imageBlock(upload.url)])).status).toBe(200);
    });

    it('validates the cover URL sent as JSON', async () => {
        expect((await adminAgent.post('/api/notices').send({ title: 'x', description: 'y', imageUrl: 'https://evil.example/x.png' })).status).toBe(400);
        expect((await adminAgent.post('/api/notices').send({ title: 'x', description: 'y', imageUrl: '/uploads/00000000-0000-4000-8000-000000000000.webp' })).status).toBe(400);

        const cover = await uploadImage(adminAgent);
        const created = await adminAgent.post('/api/notices').send({ title: 'x', description: 'y', imageUrl: cover.url });
        expect(created.status).toBe(200);
        expect(created.body.imageUrl).toBe(cover.url);
    });

    it('allows only safe button links', async () => {
        const button = (url) => [{ id: 'button01', type: 'button', label: 'Ir', url }];
        for (const url of ['javascript:alert(1)', '//evil.example', 'data:text/html,hola', 'ftp://files.example/x', '/relative']) {
            expect((await createWithContent(button(url))).status, url).toBe(400);
        }
        for (const url of ['https://ok.example/path?x=1', 'mailto:decanato@undc.edu.pe']) {
            expect((await createWithContent(button(url))).status, url).toBe(200);
        }
    });

    it('normalizes valid video links and rejects spoofed ones', async () => {
        const video = (url) => [{ id: 'video001', type: 'video', url }];
        const vimeo = await createWithContent(video('https://player.vimeo.com/video/123456789?h=abcdef1234'));
        expect((await storedContent(vimeo))[0]).toMatchObject({ provider: 'vimeo', videoId: '123456789', hash: 'abcdef1234' });
        const facebook = await createWithContent(video('https://www.facebook.com/undc/videos/1234567890'));
        expect((await storedContent(facebook))[0]).toEqual({
            id: 'video001', type: 'video', provider: 'facebook', url: 'https://www.facebook.com/undc/videos/1234567890/'
        });

        for (const url of ['https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ', 'javascript:alert(1)', 'https://fb.watch/abc/']) {
            expect((await createWithContent(video(url))).status, url).toBe(400);
        }
    });

    it('accepts the content as JSON text in multipart requests', async () => {
        const content = [textBlock('<p>Desde multipart</p>'), dividerBlock()];
        const created = await adminAgent.post('/api/notices').field('title', 'Multipart').field('content', JSON.stringify(content));
        expect(created.status).toBe(200);
        expect((await storedContent(created)).map((block) => block.type)).toEqual(['text', 'divider']);

        const invalid = await adminAgent.post('/api/notices').field('title', 'Bad').field('content', '{not json');
        expect(invalid.status).toBe(400);
    });
});

describe('summary rules', () => {
    it('derives the summary from the first text block and falls back to the title', async () => {
        const withText = await createWithContent([dividerBlock(), textBlock(`<p>${'palabra '.repeat(80)}</p>`)]);
        const summary = (await Notice.findById(withText.body._id).lean()).description;
        expect(Array.from(summary)).toHaveLength(300);
        expect(summary.startsWith('palabra palabra')).toBe(true);

        const withoutText = await createWithContent([dividerBlock()], { title: 'Solo imagen' });
        expect((await Notice.findById(withoutText.body._id).lean()).description).toBe('Solo imagen');
    });

    it('uses the summary sent by the editor and rejects one that is too long', async () => {
        const response = await createWithContent([textBlock('<p>Cuerpo</p>')], { description: '  Resumen propio  ' });
        expect(response.status).toBe(200);
        expect((await Notice.findById(response.body._id).lean()).description).toBe('Resumen propio');

        const tooLong = await createWithContent([textBlock('<p>Cuerpo</p>')], { description: 'a'.repeat(301) });
        expect(tooLong.status).toBe(400);
        expect(tooLong.body).toEqual(['Summary is too long (max 300 characters)']);
    });

    it('requires a description when no blocks are sent', async () => {
        expect((await adminAgent.post('/api/notices').send({ title: 'Sin nada' })).status).toBe(400);
    });

    it('replaces a long legacy body with a derived summary when blocks arrive without one', async () => {
        const legacy = await Notice.create({ title: 'Legacy', description: 'palabra '.repeat(100).trim(), user: admin._id });
        const response = await adminAgent.put(`/api/notices/${legacy._id}`).send({ content: [textBlock('<p>Cuerpo nuevo</p>')] });
        expect(response.status).toBe(200);
        expect((await Notice.findById(legacy._id).lean()).description).toBe('Cuerpo nuevo');
    });
});

describe('updating content', () => {
    it('leaves the blocks alone when content is not sent and clears them with an empty list', async () => {
        const created = await createWithContent([textBlock('<p>Original</p>'), dividerBlock()]);
        const id = created.body._id;

        expect((await adminAgent.put(`/api/notices/${id}`).send({ title: 'Nuevo título' })).status).toBe(200);
        expect((await storedContent(created)).map((block) => block.type)).toEqual(['text', 'divider']);

        const cleared = await adminAgent.put(`/api/notices/${id}`).send({ content: [] });
        expect(cleared.status).toBe(200);
        const stored = await Notice.findById(id).lean();
        expect(stored.content).toEqual([]);
        expect(stored.readingMinutes).toBe(1);
    });

    it('accepts JSON bodies with native booleans', async () => {
        const created = await createWithContent([dividerBlock()]);
        const response = await adminAgent.put(`/api/notices/${created.body._id}`).send({ hidden: true, featured: true });
        expect(response.status).toBe(200);
        expect(await Notice.findById(created.body._id).lean()).toMatchObject({ hidden: true, featured: true });
    });

    it('keeps the legacy body of a notice that never gets blocks', async () => {
        const created = await adminAgent.post('/api/notices').send({ title: 'Legado', description: 'Cuerpo legado' });
        await adminAgent.put(`/api/notices/${created.body._id}`).send({ title: 'Legado editado' });
        const stored = await Notice.findById(created.body._id).lean();
        expect(stored.description).toBe('Cuerpo legado');
        expect(stored.content).toBeUndefined();
    });
});

describe('uploaded files lifecycle', () => {
    it('removes an image and its thumbnail when the notice stops using it', async () => {
        const photo = await uploadImage(adminAgent);
        const kept = await uploadImage(adminAgent);
        const created = await createWithContent([imageBlock(photo.url), imageBlock(kept.url, 'image002')]);
        expect(await exists(photo.url)).toBe(true);
        expect(await exists(thumbOf(photo.url))).toBe(true);

        const response = await adminAgent.put(`/api/notices/${created.body._id}`).send({ content: [imageBlock(kept.url, 'image002')] });
        expect(response.status).toBe(200);
        expect(await exists(photo.url)).toBe(false);
        expect(await exists(thumbOf(photo.url))).toBe(false);
        expect(await exists(kept.url)).toBe(true);
        expect((await Notice.findById(created.body._id).lean()).mediaRefs).toEqual([kept.url]);
    });

    it('keeps a file while another notice still references it', async () => {
        const shared = await uploadImage(adminAgent);
        const first = await createWithContent([imageBlock(shared.url)]);
        const second = await createWithContent([galleryBlock([shared.url])]);

        await adminAgent.put(`/api/notices/${first.body._id}`).send({ content: [] });
        expect(await exists(shared.url)).toBe(true);

        await adminAgent.put(`/api/notices/${second.body._id}`).send({ content: [] });
        expect(await exists(shared.url)).toBe(false);
    });

    it('does not touch uploads that were not saved yet when another notice changes', async () => {
        const photo = await uploadImage(adminAgent);
        const pending = await uploadImage(adminAgent);
        const created = await createWithContent([imageBlock(photo.url)]);

        await adminAgent.put(`/api/notices/${created.body._id}`).send({ content: [] });
        expect(await exists(photo.url)).toBe(false);
        expect(await exists(pending.url)).toBe(true);
        expect(await exists(thumbOf(pending.url))).toBe(true);
    });

    it('removes the cover, images and galleries when the notice is deleted', async () => {
        const [cover, photo, galleryOne, galleryTwo, shared] = [
            await uploadImage(adminAgent), await uploadImage(adminAgent), await uploadImage(adminAgent),
            await uploadImage(adminAgent), await uploadImage(adminAgent)
        ];
        await createWithContent([imageBlock(shared.url)]);
        const created = await createWithContent(
            [imageBlock(photo.url), galleryBlock([galleryOne.url, galleryTwo.url]), imageBlock(shared.url, 'image002')],
            { imageUrl: cover.url }
        );

        expect((await adminAgent.delete(`/api/notices/${created.body._id}`)).status).toBe(204);
        for (const upload of [cover, photo, galleryOne, galleryTwo]) {
            expect(await exists(upload.url), upload.url).toBe(false);
            expect(await exists(thumbOf(upload.url)), upload.thumbUrl).toBe(false);
        }
        expect(await exists(shared.url)).toBe(true);
    });

    it('replaces the cover sent as a file and removes the previous one', async () => {
        const created = await adminAgent.post('/api/notices')
            .field('title', 'Con portada').field('description', 'Texto')
            .attach('imageUrl', await makeImage(), { filename: 'cover.png', contentType: 'image/png' });
        const firstCover = created.body.imageUrl;
        expect(await exists(firstCover)).toBe(true);

        const replaced = await adminAgent.put(`/api/notices/${created.body._id}`)
            .field('title', 'Con portada nueva')
            .attach('imageUrl', await makeImage({ width: 60 }), { filename: 'cover2.png', contentType: 'image/png' });
        expect(replaced.status).toBe(200);
        expect(replaced.body.imageUrl).not.toBe(firstCover);
        expect(await exists(firstCover)).toBe(false);
        expect(await exists(replaced.body.imageUrl)).toBe(true);
    });

    it('removes the cover when it is cleared and keeps legacy covers referenced elsewhere', async () => {
        const photo = await uploadImage(adminAgent);
        const created = await adminAgent.post('/api/notices').send({ title: 'Con portada', description: 'Texto', imageUrl: photo.url });
        const update = await adminAgent.put(`/api/notices/${created.body._id}`).send({ imageUrl: '' });
        expect(update.status).toBe(200);
        expect(await exists(photo.url)).toBe(false);

        // documentos legados: sin mediaRefs, solo con imageUrl
        const legacyCover = await uploadImage(adminAgent);
        await Notice.collection.insertOne({
            title: 'Legacy A', description: 'x', imageUrl: legacyCover.url, user: admin._id, date: new Date(),
            createdAt: new Date(), updatedAt: new Date()
        });
        const other = await Notice.create({ title: 'Legacy B', description: 'x', imageUrl: legacyCover.url, user: admin._id });
        expect((await adminAgent.delete(`/api/notices/${other._id}`)).status).toBe(204);
        expect(await exists(legacyCover.url)).toBe(true);
    });

    it('still answers 204 when the file was already gone', async () => {
        const photo = await uploadImage(adminAgent);
        const created = await createWithContent([imageBlock(photo.url)]);
        await (await import('fs/promises')).unlink(path.join(ctx.uploadDirectory, path.basename(photo.url)));

        expect((await adminAgent.delete(`/api/notices/${created.body._id}`)).status).toBe(204);
    });
});

describe('authorization of the new endpoints', () => {
    it('keeps editors away from other notices when they send blocks', async () => {
        const foreign = await Notice.create({ title: 'Foreign', description: 'x', user: admin._id });
        const editorAgent = await loginAgent(app, editor.email);

        const response = await editorAgent.put(`/api/notices/${foreign._id}`).send({ content: [dividerBlock()] });
        expect(response.status).toBe(404);
        expect((await Notice.findById(foreign._id).lean()).content).toBeUndefined();
    });

    it('rejects cross-origin writes to the media endpoint', async () => {
        const response = await adminAgent.post('/api/media')
            .set('Origin', 'https://evil.example')
            .attach('file', await makeImage(), { filename: 'photo.png', contentType: 'image/png' });
        expect(response.status).toBe(403);
    });
});
