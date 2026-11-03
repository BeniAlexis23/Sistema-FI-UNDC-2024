import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import sharp from 'sharp';
import { createUsers, loginAgent, startTestApp, uploadImage } from './helpers.js';

let ctx;
let app;
let Notice;
let admin;
let adminAgent;

const origin = 'http://localhost:5173';
const hoursFromNow = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);
const createNotice = (fields = {}) => Notice.create({ title: 'Noticia', description: 'Texto', user: admin._id, ...fields });
const metaContent = (html, key) => new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)">`).exec(html)?.[1];

beforeAll(async () => {
    ctx = await startTestApp();
    ({ app, Notice } = ctx);
});

beforeEach(async () => {
    await Promise.all([ctx.User.deleteMany({}), Notice.deleteMany({})]);
    [admin] = await createUsers(ctx.User);
    adminAgent = await loginAgent(app, admin.email);
});

afterAll(() => ctx.stop());

describe('share page', () => {
    it('serves escaped Open Graph metadata and sends people to the portal', async () => {
        const notice = await createNotice({
            title: '"><script>alert(1)</script> & Co', description: 'Ciencia &amp; <b>más</b>   texto'
        });

        const response = await request(app).get(`/compartir/noticias/${notice._id}`);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/^text\/html/);
        expect(response.headers['content-security-policy']).toBe("default-src 'none'");
        expect(response.headers['x-robots-tag']).toBe('noindex');
        expect(response.headers['cache-control']).toBe('no-cache');

        const html = response.text;
        expect(html).not.toContain('<script>');
        expect(metaContent(html, 'og:title')).toBe('&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt; &amp; Co');
        expect(metaContent(html, 'og:description')).toBe('Ciencia & más texto'.replace('&', '&amp;'));
        expect(metaContent(html, 'og:url')).toBe(`${origin}/compartir/noticias/${notice._id}`);
        expect(metaContent(html, 'og:image')).toBe(`${origin}/og-default.png`);
        expect(metaContent(html, 'twitter:card')).toBe('summary_large_image');
        expect(html).toContain(`<meta http-equiv="refresh" content="0;url=${origin}/#/noticias/${notice._id}">`);
        expect(html).toContain(`<link rel="canonical" href="${origin}/#/noticias/${notice._id}">`);
    });

    it('uses the cover as a 1200x630 JPEG and truncates long descriptions', async () => {
        const cover = await uploadImage(adminAgent, { width: 900, height: 900 });
        const created = await adminAgent.post('/api/notices')
            .send({ title: 'Con portada', description: 'palabra '.repeat(100).trim(), imageUrl: cover.url, imageAlt: 'Foto del evento' });
        expect(created.status).toBe(200);

        const page = await request(app).get(`/compartir/noticias/${created.body._id}`);
        expect(metaContent(page.text, 'og:image')).toBe(`${origin}/compartir/noticias/${created.body._id}/portada.jpg`);
        expect(metaContent(page.text, 'og:image:alt')).toBe('Foto del evento');
        expect(Array.from(metaContent(page.text, 'og:description')).length).toBeLessThanOrEqual(200);

        const image = await request(app).get(`/compartir/noticias/${created.body._id}/portada.jpg`).buffer(true).parse((res, callback) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => callback(null, Buffer.concat(chunks)));
        });
        expect(image.status).toBe(200);
        expect(image.headers['content-type']).toBe('image/jpeg');
        expect(await sharp(image.body).metadata()).toMatchObject({ format: 'jpeg', width: 1200, height: 630 });
    });

    it('does not reveal hidden, scheduled or unknown notices', async () => {
        const hidden = await createNotice({ title: 'Secreta oculta', hidden: true });
        const scheduled = await createNotice({ title: 'Secreta programada', publishAt: hoursFromNow(3) });
        const ids = [hidden._id, scheduled._id, '64b7f0c2a1b2c3d4e5f60718', 'not-an-id'];

        for (const id of ids) {
            const response = await request(app).get(`/compartir/noticias/${id}`);
            expect(response.status, String(id)).toBe(404);
            expect(response.text).not.toContain('Secreta');
            expect(response.text).toContain('http-equiv="refresh"');
        }
    });

    it('serves the cover only for visible notices that have one', async () => {
        const cover = await uploadImage(adminAgent);
        const hidden = await createNotice({ imageUrl: cover.url, hidden: true });
        const withoutCover = await createNotice();

        expect((await request(app).get(`/compartir/noticias/${hidden._id}/portada.jpg`)).status).toBe(404);
        expect((await request(app).get(`/compartir/noticias/${withoutCover._id}/portada.jpg`)).status).toBe(404);
        expect((await request(app).get('/compartir/noticias/not-an-id/portada.jpg')).status).toBe(404);
    });
});
