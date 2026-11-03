import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { execFile } from 'child_process';
import { unlink, utimes } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import request from 'supertest';
import { MAX_SLIDES } from '../src/schemas/hero.schema.js';
import { createUsers, fileExists, loginAgent, startTestApp, uploadImage } from './helpers.js';

const run = promisify(execFile);
const backendDirectory = fileURLToPath(new URL('..', import.meta.url));

let ctx;
let app;
let Notice;
let HeroSlide;
let SiteSetting;
let admin;
let editor;
let adminAgent;

const HOUR = 60 * 60 * 1000;
const UNKNOWN_ID = '507f1f77bcf86cd799439011';
const inHours = (hours) => new Date(Date.now() + hours * HOUR).toISOString();
const exists = (url) => fileExists(ctx.uploadDirectory, url);
const thumbOf = (url) => url.replace(/\.webp$/, '-480.webp');
const titles = (slides) => slides.map((slide) => slide.title);

const publicHero = () => request(app).get('/api/portada/hero');
const adminList = async () => (await adminAgent.get('/api/hero-slides')).body;
const makeNotice = (extra = {}) => Notice.create({ title: 'Noticia', description: 'Resumen de la noticia', user: admin._id, ...extra });

const addSlide = async (extra = {}) => {
    const image = await uploadImage(adminAgent);
    const response = await adminAgent.post('/api/hero-slides').send({ image: image.url, ...extra });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    return { slide: response.body, image };
};

beforeAll(async () => {
    ctx = await startTestApp();
    ({ app, Notice } = ctx);
    ({ default: HeroSlide } = await import('../src/models/heroSlide.model.js'));
    ({ default: SiteSetting } = await import('../src/models/siteSetting.model.js'));
});

beforeEach(async () => {
    await Promise.all([ctx.User.deleteMany({}), Notice.deleteMany({}), HeroSlide.deleteMany({}), SiteSetting.deleteMany({})]);
    [admin, editor] = await createUsers(ctx.User);
    adminAgent = await loginAgent(app, admin.email);
});

afterAll(() => ctx.stop());

describe('public hero', () => {
    it('answers without a session and falls back to the defaults when nothing is configured', async () => {
        const response = await publicHero();
        expect(response.status).toBe(200);
        expect(response.headers['cache-control']).toBe('no-cache');
        expect(response.body).toEqual({ intervalSeconds: 6, slides: [] });
    });

    it('lists active slides in order and leaves out inactive, scheduled and expired ones', async () => {
        const first = await addSlide({ title: 'Primera', alt: 'Texto alternativo' });
        await addSlide({ title: 'Segunda', startAt: inHours(-2), endAt: inHours(2) });
        await addSlide({ title: 'Apagada', active: false });
        await addSlide({ title: 'Futura', startAt: inHours(1) });
        await addSlide({ title: 'Vencida', startAt: inHours(-5), endAt: inHours(-1) });

        const { body } = await publicHero();
        expect(titles(body.slides)).toEqual(['Primera', 'Segunda']);
        expect(body.slides[0]).toEqual({
            id: first.slide._id, image: first.image.url, imageMobile: null, alt: 'Texto alternativo',
            title: 'Primera', subtitle: '', focusX: 50, focusY: 50, link: null
        });
    });

    it('links to a notice only while that notice is public', async () => {
        const visible = await makeNotice();
        const hidden = await makeNotice({ hidden: true });
        const scheduled = await makeNotice({ publishAt: new Date(Date.now() + HOUR) });
        await addSlide({ title: 'A', notice: String(visible._id), ctaLabel: 'Leer' });
        await addSlide({ title: 'B', notice: String(hidden._id), ctaLabel: 'Leer' });
        await addSlide({ title: 'C', notice: String(scheduled._id) });
        await addSlide({ title: 'D', ctaUrl: 'https://example.com/matricula', ctaLabel: 'Matricúlate' });
        await addSlide({ title: 'E', ctaUrl: 'https://example.com/otro' });

        const { body } = await publicHero();
        const links = Object.fromEntries(body.slides.map((slide) => [slide.title, slide.link]));
        expect(links.A).toEqual({ label: 'Leer', url: `/noticias/${visible._id}`, internal: true });
        expect(links.B).toBeNull();
        expect(links.C).toBeNull();
        expect(links.D).toEqual({ label: 'Matricúlate', url: 'https://example.com/matricula', internal: false });
        expect(links.E).toEqual({ label: 'Más información', url: 'https://example.com/otro', internal: false });
    });

    it('adds the newest featured notices with a cover only when the setting is on', async () => {
        const cover = (digit) => `/uploads/${String(digit).repeat(8)}-0000-4000-8000-000000000000.webp`;
        const linked = await makeNotice({ title: 'Ya enlazada', featured: true, imageUrl: cover(1) });
        for (const number of [1, 2, 3, 4]) {
            await makeNotice({
                title: `Destacada ${number}`, featured: true, imageUrl: cover(number + 1), date: new Date(`2026-03-0${number}`),
                description: number === 4 ? '<p>Primer párrafo.</p><p>Segundo párrafo con <strong>detalle</strong>.</p>' : 'Resumen'
            });
        }
        await makeNotice({ title: 'Oculta', featured: true, imageUrl: cover(7), hidden: true, date: new Date('2026-04-01') });
        await makeNotice({ title: 'Sin portada', featured: true, date: new Date('2026-04-02') });
        await makeNotice({ title: 'No destacada', imageUrl: cover(8), date: new Date('2026-04-03') });
        await addSlide({ title: 'Propia', notice: String(linked._id) });

        expect(titles((await publicHero()).body.slides)).toEqual(['Propia']);

        await adminAgent.put('/api/hero-settings').send({ includeFeatured: true });
        const { slides } = (await publicHero()).body;
        expect(titles(slides)).toEqual(['Propia', 'Destacada 4', 'Destacada 3', 'Destacada 2']);
        expect(slides[1]).toMatchObject({
            image: cover(5), imageMobile: null, alt: 'Destacada 4', subtitle: 'Primer párrafo. Segundo párrafo con detalle.',
            link: { label: 'Leer noticia', internal: true }
        });
        expect(slides[1].id).toMatch(/^notice-[0-9a-f]{24}$/);
        expect(slides[1].link.url).toMatch(/^\/noticias\/[0-9a-f]{24}$/);
    });
});

describe('hero administration', () => {
    it('is closed to anonymous users and editors', async () => {
        const editorAgent = await loginAgent(app, editor.email);
        const { slide } = await addSlide();
        const calls = [
            (agent) => agent.get('/api/hero-slides'),
            (agent) => agent.post('/api/hero-slides').send({ image: slide.image }),
            (agent) => agent.put(`/api/hero-slides/${slide._id}`).send({ active: false }),
            (agent) => agent.put('/api/hero-slides/reorder').send({ ids: [slide._id] }),
            (agent) => agent.delete(`/api/hero-slides/${slide._id}`),
            (agent) => agent.put('/api/hero-settings').send({ includeFeatured: true })
        ];

        for (const call of calls) {
            expect((await call(request(app))).status).toBe(401);
            expect((await call(editorAgent)).status).toBe(403);
        }
        expect(await HeroSlide.countDocuments()).toBe(1);
        expect((await HeroSlide.findById(slide._id).lean()).active).toBe(true);
        expect((await SiteSetting.countDocuments())).toBe(0);
    });

    it('creates slides in order with defaults and records who made them', async () => {
        const first = await addSlide({ title: 'Primera' });
        const second = await addSlide({ title: 'Segunda' });

        expect(first.slide).toMatchObject({
            title: 'Primera', image: first.image.url, imageMobile: '', ctaUrl: '', notice: null, focusX: 50, focusY: 50,
            active: true, startAt: null, endAt: null, order: 0, status: 'active'
        });
        expect(second.slide.order).toBe(1);
        expect(String((await HeroSlide.findById(second.slide._id).lean()).createdBy)).toBe(String(admin._id));
    });

    it('validates the slide before saving it', async () => {
        const image = await uploadImage(adminAgent);
        const rejected = async (body) => {
            const response = await adminAgent.post('/api/hero-slides').send(body);
            expect(response.status, JSON.stringify(body)).toBe(400);
            return response.body;
        };

        await rejected({});
        await rejected({ image: image.url, unknown: 1 });
        await rejected({ image: image.url, title: 'x'.repeat(101) });
        await rejected({ image: image.url, subtitle: 'x'.repeat(201) });
        await rejected({ image: image.url, ctaLabel: 'x'.repeat(41), ctaUrl: 'https://example.com' });
        await rejected({ image: image.url, focusX: 101 });
        await rejected({ image: image.url, active: 'yes' });
        expect(await rejected({ image: 'https://evil.example/photo.webp' })).toContain('Invalid image URL');
        expect(await rejected({ image: image.url, imageMobile: '/uploads/../secret.png' })).toContain('Invalid image URL');
        expect(await rejected({ image: '/uploads/ffffffff-ffff-4fff-8fff-ffffffffffff.webp' })).toContain('Image not found');
        expect(await rejected({ image: image.url, ctaUrl: 'javascript:alert(1)' })).toContain('URL must use HTTP, HTTPS or mailto');
        expect(await rejected({ image: image.url, ctaUrl: 'https://example.com', notice: UNKNOWN_ID }))
            .toContain('Choose a web address or a notice for the button, not both');
        expect(await rejected({ image: image.url, ctaLabel: 'Sin destino' })).toContain('The button text needs a link');
        expect(await rejected({ image: image.url, startAt: inHours(2), endAt: inHours(1) })).toContain('The end must be after the start');
        expect(await rejected({ image: image.url, notice: UNKNOWN_ID })).toContain('Notice not found');
        expect(await rejected({ image: image.url, notice: 'no-es-un-id' })).toContain('Invalid resource identifier');

        expect(await HeroSlide.countDocuments()).toBe(0);
    });

    it('limits how many slides can exist', async () => {
        await HeroSlide.insertMany(Array.from({ length: MAX_SLIDES }, (_, order) => ({
            image: '/uploads/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp', order
        })));
        const image = await uploadImage(adminAgent);

        const response = await adminAgent.post('/api/hero-slides').send({ image: image.url });
        expect(response.status).toBe(400);
        expect(response.body).toEqual([`There can be at most ${MAX_SLIDES} slides`]);
    });

    it('reports the status of each slide to the panel without caching it', async () => {
        await addSlide({ title: 'Activa' });
        await addSlide({ title: 'Apagada', active: false });
        await addSlide({ title: 'Programada', startAt: inHours(3) });
        await addSlide({ title: 'Vencida', startAt: inHours(-3), endAt: inHours(-1) });

        const response = await adminAgent.get('/api/hero-slides');
        expect(response.headers['cache-control']).toBe('no-store');
        expect(response.body.slides.map((slide) => [slide.title, slide.status])).toEqual([
            ['Activa', 'active'], ['Apagada', 'inactive'], ['Programada', 'scheduled'], ['Vencida', 'expired']
        ]);
        expect(response.body.settings).toEqual({ includeFeatured: false, intervalSeconds: 6 });
    });

    it('updates only the fields that are sent and clears the ones sent empty', async () => {
        const notice = await makeNotice({ title: 'Enlazable' });
        const { slide, image } = await addSlide({
            title: 'Original', subtitle: 'Sub', ctaUrl: 'https://example.com', ctaLabel: 'Ver',
            startAt: inHours(-1), endAt: inHours(5)
        });
        const mobile = await uploadImage(adminAgent);
        const put = (body) => adminAgent.put(`/api/hero-slides/${slide._id}`).send(body);

        let response = await put({ title: 'Nuevo', imageMobile: mobile.url, focusX: 20 });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            title: 'Nuevo', subtitle: 'Sub', image: image.url, imageMobile: mobile.url, focusX: 20, focusY: 50, ctaUrl: 'https://example.com'
        });

        response = await put({ imageMobile: '', ctaUrl: '', notice: String(notice._id), startAt: '', endAt: '' });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            title: 'Nuevo', ctaLabel: 'Ver', imageMobile: '', ctaUrl: '', startAt: null, endAt: null,
            notice: { _id: String(notice._id), title: 'Enlazable' }
        });
        const stored = await HeroSlide.findById(slide._id).lean();
        for (const field of ['imageMobile', 'ctaUrl', 'startAt', 'endAt']) expect(stored, field).not.toHaveProperty(field);

        response = await put({ notice: '', ctaLabel: '' });
        expect(response.status).toBe(200);
        expect(response.body.notice).toBeNull();
    });

    it('checks the rules against the whole slide, not only the fields sent', async () => {
        const notice = await makeNotice();
        const { slide: withLink } = await addSlide({ ctaUrl: 'https://example.com', ctaLabel: 'Ver' });
        const { slide: scheduled } = await addSlide({ startAt: inHours(2) });
        const put = (id, body) => adminAgent.put(`/api/hero-slides/${id}`).send(body);

        let response = await put(withLink._id, { notice: String(notice._id) });
        expect(response.status).toBe(400);
        expect(response.body).toContain('Choose a web address or a notice for the button, not both');

        response = await put(withLink._id, { ctaUrl: '' });
        expect(response.status).toBe(400);
        expect(response.body).toContain('The button text needs a link');

        response = await put(scheduled._id, { endAt: inHours(1) });
        expect(response.status).toBe(400);
        expect(response.body).toContain('The end must be after the start');

        expect((await put(withLink._id, {})).status).toBe(400);
        const unchanged = await HeroSlide.findById(withLink._id).lean();
        expect(unchanged).toMatchObject({ ctaUrl: 'https://example.com', ctaLabel: 'Ver' });
        expect(unchanged.notice).toBeUndefined();
    });

    it('keeps a slide editable after its notice or image disappeared', async () => {
        const notice = await makeNotice();
        const { slide, image } = await addSlide({ notice: String(notice._id) });
        await Notice.deleteOne({ _id: notice._id });
        await unlink(path.join(ctx.uploadDirectory, path.basename(image.url)));

        const response = await adminAgent.put(`/api/hero-slides/${slide._id}`).send({ title: 'Sigue editable' });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ title: 'Sigue editable', notice: null });
        expect((await publicHero()).body.slides[0].link).toBeNull();
    });

    it('reorders the slides and rejects lists that do not match the stored ones', async () => {
        const [a, b, c] = [
            (await addSlide({ title: 'A' })).slide._id, (await addSlide({ title: 'B' })).slide._id, (await addSlide({ title: 'C' })).slide._id
        ];
        const reorder = (ids) => adminAgent.put('/api/hero-slides/reorder').send({ ids });

        const response = await reorder([c, a, b]);
        expect(response.status).toBe(200);
        expect(titles(response.body.slides)).toEqual(['C', 'A', 'B']);
        expect(titles((await publicHero()).body.slides)).toEqual(['C', 'A', 'B']);

        expect((await reorder([c, c, a])).status).toBe(400);
        expect((await reorder([c, a])).status).toBe(409);
        expect((await reorder([c, a, b, UNKNOWN_ID])).status).toBe(409);
        expect((await reorder([c, a, UNKNOWN_ID])).status).toBe(409);
        expect((await reorder(['no-es-un-id'])).status).toBe(400);
        expect((await reorder([])).status).toBe(400);
        expect(titles((await adminList()).slides)).toEqual(['C', 'A', 'B']);
    });

    it('stores the hero settings and validates their range', async () => {
        const put = (body) => adminAgent.put('/api/hero-settings').send(body);

        let response = await put({ includeFeatured: true });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ includeFeatured: true, intervalSeconds: 6 });

        response = await put({ intervalSeconds: 10 });
        expect(response.body).toEqual({ includeFeatured: true, intervalSeconds: 10 });
        expect((await adminList()).settings).toEqual({ includeFeatured: true, intervalSeconds: 10 });
        expect((await publicHero()).body.intervalSeconds).toBe(10);

        const invalid = [{}, { intervalSeconds: 2 }, { intervalSeconds: 21 }, { intervalSeconds: 7.5 }, { intervalSeconds: '8' }, { includeFeatured: 'yes' }, { other: 1 }];
        for (const body of invalid) expect((await put(body)).status, JSON.stringify(body)).toBe(400);
        expect((await adminList()).settings).toEqual({ includeFeatured: true, intervalSeconds: 10 });
    });

    it('deletes a slide and answers 404 for unknown ones', async () => {
        const { slide } = await addSlide();

        expect((await adminAgent.delete(`/api/hero-slides/${slide._id}`)).status).toBe(204);
        expect(await HeroSlide.countDocuments()).toBe(0);
        expect((await adminAgent.delete(`/api/hero-slides/${slide._id}`)).status).toBe(404);
        expect((await adminAgent.delete('/api/hero-slides/no-es-un-id')).status).toBe(400);
        expect((await adminAgent.put(`/api/hero-slides/${UNKNOWN_ID}`).send({ active: false })).status).toBe(404);
    });
});

describe('hero images', () => {
    it('removes the previous files when an image is replaced or cleared and when the slide is deleted', async () => {
        const mobile = await uploadImage(adminAgent);
        const { slide, image } = await addSlide({ imageMobile: mobile.url });
        const replacement = await uploadImage(adminAgent);

        const response = await adminAgent.put(`/api/hero-slides/${slide._id}`).send({ image: replacement.url, imageMobile: '' });
        expect(response.status).toBe(200);
        for (const old of [image, mobile]) {
            expect(await exists(old.url), old.url).toBe(false);
            expect(await exists(thumbOf(old.url)), old.thumbUrl).toBe(false);
        }
        expect(await exists(replacement.url)).toBe(true);

        expect((await adminAgent.delete(`/api/hero-slides/${slide._id}`)).status).toBe(204);
        expect(await exists(replacement.url)).toBe(false);
        expect(await exists(thumbOf(replacement.url))).toBe(false);
    });

    it('keeps a file while another slide or a notice still uses it', async () => {
        const { slide: first, image } = await addSlide();
        const second = await adminAgent.post('/api/hero-slides').send({ image: image.url });
        expect(second.status).toBe(201);
        const notice = await adminAgent.post('/api/notices').send({ title: 'Misma imagen', description: 'x', imageUrl: image.url });
        expect(notice.status).toBe(200);

        await adminAgent.delete(`/api/hero-slides/${first._id}`);
        expect(await exists(image.url)).toBe(true);

        await adminAgent.delete(`/api/hero-slides/${second.body._id}`);
        expect(await exists(image.url)).toBe(true);

        await adminAgent.put(`/api/notices/${notice.body._id}`).send({ imageUrl: '' });
        expect(await exists(image.url)).toBe(false);
        expect(await exists(thumbOf(image.url))).toBe(false);
    });

    it('keeps a slide image when a notice that also used it is deleted', async () => {
        const { image } = await addSlide();
        const notice = await adminAgent.post('/api/notices').send({ title: 'Misma imagen', description: 'x', imageUrl: image.url });
        expect(notice.status).toBe(200);

        expect((await adminAgent.delete(`/api/notices/${notice.body._id}`)).status).toBe(204);
        expect(await exists(image.url)).toBe(true);
        expect(await exists(thumbOf(image.url))).toBe(true);
    });
});

describe('upload garbage collection', () => {
    it('never offers hero images for deletion, only the ones nobody uses', async () => {
        const desktop = await uploadImage(adminAgent);
        const mobile = await uploadImage(adminAgent);
        const orphan = await uploadImage(adminAgent);
        const create = await adminAgent.post('/api/hero-slides').send({ image: desktop.url, imageMobile: mobile.url });
        expect(create.status).toBe(201);

        const longAgo = new Date(Date.now() - 72 * HOUR);
        for (const upload of [desktop, mobile, orphan]) {
            for (const url of [upload.url, thumbOf(upload.url)]) {
                await utimes(path.join(ctx.uploadDirectory, path.basename(url)), longAgo, longAgo);
            }
        }

        const uuidOf = (upload) => path.basename(upload.url, '.webp');
        const gc = (...flags) => run(process.execPath, ['scripts/gc-uploads.js', ...flags], {
            cwd: backendDirectory,
            env: { ...process.env, NODE_ENV: 'test', UPLOAD_DIR: ctx.uploadDirectory, MONGODB_LOCAL: process.env.MONGODB_LOCAL }
        });

        const dryRun = (await gc()).stdout;
        expect(dryRun).toContain('1 diapositiva(s) de la portada');
        expect(dryRun).toContain(uuidOf(orphan));
        expect(dryRun).not.toContain(uuidOf(desktop));
        expect(dryRun).not.toContain(uuidOf(mobile));
        expect(await exists(orphan.url)).toBe(true);

        await gc('--apply');
        expect(await exists(orphan.url)).toBe(false);
        expect(await exists(thumbOf(orphan.url))).toBe(false);
        for (const upload of [desktop, mobile]) {
            expect(await exists(upload.url), upload.url).toBe(true);
            expect(await exists(thumbOf(upload.url)), upload.thumbUrl).toBe(true);
        }
    }, 60_000);
});
