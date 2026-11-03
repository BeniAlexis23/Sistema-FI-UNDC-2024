import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createUsers, loginAgent, startTestApp } from './helpers.js';

let ctx;
let app;
let Notice;
let Category;
let admin;
let editor;
let other;

const DAY_MS = 24 * 60 * 60 * 1000;
const day = (offset) => new Date(Date.UTC(2026, 0, 1 + offset));
const hoursFromNow = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);
const daysAgo = (days) => new Date(Date.now() - days * DAY_MS);
const titles = (response) => response.body.map((notice) => notice.title);
const itemTitles = (response) => response.body.items.map((notice) => notice.title);

const createNotice = (fields = {}) => Notice.create({
    title: 'Noticia', description: 'Texto', user: admin._id, ...fields
});

/* Documento legado: creado antes de hidden, publishAt, featured, category y content */
const insertLegacyNotice = async (fields = {}) => {
    const { insertedId } = await Notice.collection.insertOne({
        title: 'Legacy', description: 'Texto legado', date: day(5), user: admin._id,
        createdAt: new Date(), updatedAt: new Date(), ...fields
    });
    return insertedId;
};

beforeAll(async () => {
    ctx = await startTestApp();
    ({ app, Notice, Category } = ctx);
});

beforeEach(async () => {
    await Promise.all([ctx.User.deleteMany({}), Notice.deleteMany({}), Category.deleteMany({})]);
    [admin, editor, other] = await createUsers(ctx.User);
});

afterAll(() => ctx.stop());

describe('public notices', () => {
    it('hides hidden and scheduled notices and keeps legacy documents visible', async () => {
        await createNotice({ title: 'First', date: day(0) });
        await createNotice({ title: 'Hidden', hidden: true });
        await createNotice({ title: 'Scheduled', publishAt: hoursFromNow(2) });
        await createNotice({ title: 'Released', publishAt: hoursFromNow(-2) });
        await insertLegacyNotice();

        const response = await request(app).get('/api/noticias');
        expect(response.status).toBe(200);
        // sin parámetros se conserva el orden de inserción del cliente anterior
        expect(titles(response)).toEqual(['First', 'Released', 'Legacy']);
        for (const notice of response.body) {
            expect(notice).not.toHaveProperty('content');
            expect(notice).not.toHaveProperty('user');
        }
    });

    it('sorts newest first when asked, breaking ties by creation order', async () => {
        await createNotice({ title: 'Oldest', date: day(0) });
        await createNotice({ title: 'Newest', date: day(30) });
        await createNotice({ title: 'Hidden', date: day(40), hidden: true });
        await createNotice({ title: 'Middle A', date: day(15) });
        await createNotice({ title: 'Middle B', date: day(15) });
        await insertLegacyNotice({ date: day(10) });

        const response = await request(app).get('/api/noticias?sort=date_desc');
        expect(titles(response)).toEqual(['Newest', 'Middle B', 'Middle A', 'Legacy', 'Oldest']);
    });

    it('shows a scheduled notice once its publish time has passed', async () => {
        const scheduled = await createNotice({ title: 'Later', publishAt: hoursFromNow(1) });
        expect((await request(app).get('/api/noticias')).body).toHaveLength(0);

        await Notice.updateOne({ _id: scheduled._id }, { publishAt: hoursFromNow(-1) });
        expect(titles(await request(app).get('/api/noticias'))).toEqual(['Later']);
    });

    it('returns 404 for hidden or scheduled notices and 200 for visible and legacy ones', async () => {
        const hidden = await createNotice({ hidden: true });
        const scheduled = await createNotice({ publishAt: hoursFromNow(1) });
        const visible = await createNotice({ title: 'Visible' });
        const legacyId = await insertLegacyNotice({ description: 'Ciencia &amp; Tecnología' });

        expect((await request(app).get(`/api/noticias/${hidden._id}`)).status).toBe(404);
        expect((await request(app).get(`/api/noticias/${scheduled._id}`)).status).toBe(404);

        const visibleResponse = await request(app).get(`/api/noticias/${visible._id}`);
        expect(visibleResponse.status).toBe(200);
        expect(visibleResponse.body).not.toHaveProperty('user');
        expect(visibleResponse.body.content).toEqual([]);

        const legacyResponse = await request(app).get(`/api/noticias/${legacyId}`);
        expect(legacyResponse.status).toBe(200);
        expect(legacyResponse.body.description).toBe('Ciencia & Tecnología');
    });

    it('supports limit, category and featuredFirst', async () => {
        const [avisos, eventos] = await Category.create([
            { name: 'Avisos', slug: 'avisos' },
            { name: 'Eventos', slug: 'eventos' }
        ]);
        await createNotice({ title: 'A1', date: day(1), category: avisos._id });
        await createNotice({ title: 'A2', date: day(2), category: avisos._id, featured: true });
        await createNotice({ title: 'E1', date: day(3), category: eventos._id });
        await createNotice({ title: 'E2', date: day(4), category: eventos._id });

        expect(titles(await request(app).get('/api/noticias?limit=2'))).toEqual(['E2', 'E1']);

        const byCategory = await request(app).get('/api/noticias?category=avisos');
        expect(titles(byCategory)).toEqual(['A2', 'A1']);
        expect(byCategory.body[0].category).toMatchObject({ name: 'Avisos', slug: 'avisos' });

        expect(titles(await request(app).get('/api/noticias?featuredFirst=1&limit=3'))).toEqual(['A2', 'E2', 'E1']);
        expect(titles(await request(app).get('/api/noticias?featuredFirst=1&limit=1'))).toEqual(['A2']);
        expect((await request(app).get('/api/noticias?category=no-existe')).body).toEqual([]);
    });

    it('prioritizes at most three featured notices', async () => {
        for (let index = 0; index < 5; index += 1) {
            await createNotice({ title: `Featured ${index}`, date: day(index), featured: true });
        }
        await createNotice({ title: 'Plain', date: day(10) });

        const response = await request(app).get('/api/noticias?featuredFirst=1');
        expect(titles(response)).toEqual(['Featured 4', 'Featured 3', 'Featured 2', 'Plain', 'Featured 1', 'Featured 0']);
    });

    it('rejects invalid parameters and ignores nested query objects', async () => {
        await createNotice({ title: 'Only' });

        expect((await request(app).get('/api/noticias?limit=500')).status).toBe(400);
        expect((await request(app).get('/api/noticias?limit=abc')).status).toBe(400);
        expect((await request(app).get('/api/noticias?category=Bad Slug!')).status).toBe(400);

        const injected = await request(app).get('/api/noticias?category[$ne]=x&sort[$gt]=');
        expect(injected.status).toBe(200);
        expect(titles(injected)).toEqual(['Only']);
    });

    it('returns a short summary in lists and the full text in the detail', async () => {
        const body = 'palabra '.repeat(200).trim();
        const notice = await createNotice({ description: body });

        const list = await request(app).get('/api/noticias');
        expect(Array.from(list.body[0].description)).toHaveLength(300);

        const detail = await request(app).get(`/api/noticias/${notice._id}`);
        expect(detail.body.description).toBe(body);
        expect(detail.body.readingMinutes).toBe(1);
    });

    it('computes reading time, the recent flag and revalidation headers', async () => {
        await createNotice({ title: 'Long', description: Array.from({ length: 450 }, () => 'palabra').join(' '), date: daysAgo(30) });
        await createNotice({ title: 'Recent', date: daysAgo(2) });
        await createNotice({ title: 'Released', date: daysAgo(30), publishAt: hoursFromNow(-3) });
        await createNotice({ title: 'Future date', date: hoursFromNow(48) });

        const response = await request(app).get('/api/noticias');
        const byTitle = Object.fromEntries(response.body.map((notice) => [notice.title, notice]));
        expect(byTitle.Long.readingMinutes).toBe(3);
        expect(byTitle.Long.isNew).toBe(false);
        expect(byTitle.Recent.isNew).toBe(true);
        expect(byTitle.Released.isNew).toBe(true);
        expect(byTitle['Future date'].isNew).toBe(false);
        expect(response.headers['cache-control']).toBe('no-cache');
    });
});

describe('admin notice list', () => {
    const seedFilterable = async () => {
        const [avisos, eventos] = await Category.create([
            { name: 'Avisos', slug: 'avisos' },
            { name: 'Eventos', slug: 'eventos' }
        ]);
        await createNotice({ title: 'Beca de excelencia', date: day(10), category: avisos._id, featured: true });
        await createNotice({ title: 'Matrícula 2026', date: day(20), hidden: true });
        await createNotice({ title: 'Taller de IA', date: day(30), category: eventos._id, publishAt: hoursFromNow(5) });
        await createNotice({ title: 'Charla de Física', date: day(40) });
        return { avisos, eventos };
    };

    it('returns the legacy array without parameters and a page with them', async () => {
        await createNotice({ title: 'Mine', user: editor._id });
        await createNotice({ title: 'Theirs', user: other._id });
        const adminAgent = await loginAgent(app, admin.email);
        const editorAgent = await loginAgent(app, editor.email);

        const legacy = await adminAgent.get('/api/notices');
        expect(Array.isArray(legacy.body)).toBe(true);
        expect(titles(legacy)).toEqual(['Mine', 'Theirs']);
        expect(legacy.headers['cache-control']).toBe('no-store');

        const page = await editorAgent.get('/api/notices?page=1');
        expect(page.body).toMatchObject({ total: 1, page: 1, limit: 12 });
        expect(itemTitles(page)).toEqual(['Mine']);
        expect(page.body.items[0]).not.toHaveProperty('content');
        expect(page.body.items[0]).toMatchObject({ status: 'published', hidden: false, author: 'Editor' });
    });

    it('filters by status, text, category, featured and date range', async () => {
        const { avisos } = await seedFilterable();
        const agent = await loginAgent(app, admin.email);
        const query = async (params) => itemTitles(await agent.get(`/api/notices?${params}`));

        expect(await query('status=published')).toEqual(['Charla de Física', 'Beca de excelencia']);
        expect(await query('status=hidden')).toEqual(['Matrícula 2026']);
        expect(await query('status=scheduled')).toEqual(['Taller de IA']);
        expect(await query('q=TALLER')).toEqual(['Taller de IA']);
        expect(await query(`category=${avisos._id}`)).toEqual(['Beca de excelencia']);
        expect(await query('category=none')).toEqual(['Charla de Física', 'Matrícula 2026']);
        expect(await query('featured=1')).toEqual(['Beca de excelencia']);
        expect(await query('from=2026-01-21&to=2026-02-10')).toEqual(['Charla de Física', 'Taller de IA', 'Matrícula 2026']);
        expect(await query('from=2026-01-22')).toEqual(['Charla de Física', 'Taller de IA']);
    });

    it('treats the search text literally and sorts and paginates', async () => {
        await seedFilterable();
        const agent = await loginAgent(app, admin.email);
        const query = async (params) => itemTitles(await agent.get(`/api/notices?${params}`));

        expect(await query(`q=${encodeURIComponent('(a+)+$')}`)).toEqual([]);
        expect(await query(`q=${encodeURIComponent('.*')}`)).toEqual([]);

        expect(await query('sort=title_asc&limit=50')).toEqual([
            'Beca de excelencia', 'Charla de Física', 'Matrícula 2026', 'Taller de IA'
        ]);
        expect(await query('sort=date_asc')).toEqual([
            'Beca de excelencia', 'Matrícula 2026', 'Taller de IA', 'Charla de Física'
        ]);

        const second = await agent.get('/api/notices?limit=2&page=2');
        expect(second.body).toMatchObject({ total: 4, page: 2, limit: 2 });
        expect(itemTitles(second)).toEqual(['Matrícula 2026', 'Beca de excelencia']);
    });

    it('rejects invalid filters', async () => {
        const agent = await loginAgent(app, admin.email);
        for (const params of ['status=bogus', 'page=0', 'limit=51', 'from=2026-13-45', 'category=abc', 'sort=random']) {
            expect((await agent.get(`/api/notices?${params}`)).status).toBe(400);
        }
    });

    it('counts notices by status within the user scope', async () => {
        await seedFilterable();
        await createNotice({ title: 'Editor notice', user: editor._id });

        const adminStats = await (await loginAgent(app, admin.email)).get('/api/notices/stats');
        expect(adminStats.body).toEqual({ total: 5, published: 3, hidden: 1, scheduled: 1 });

        const editorStats = await (await loginAgent(app, editor.email)).get('/api/notices/stats');
        expect(editorStats.body).toEqual({ total: 1, published: 1, hidden: 0, scheduled: 0 });
    });

    it('returns the full notice with a decoded description to the editor form', async () => {
        const legacyId = await insertLegacyNotice({ description: 'Ciencia &amp; Tecnología' });
        const response = await (await loginAgent(app, admin.email)).get(`/api/notices/${legacyId}`);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ description: 'Ciencia & Tecnología', content: [], status: 'published' });
    });
});

describe('notice visibility and publication fields', () => {
    it('hides and features a notice from the list and bumps updatedAt', async () => {
        const notice = await createNotice({ title: 'Toggle' });
        const agent = await loginAgent(app, admin.email);

        const hidden = await agent.patch(`/api/notices/${notice._id}/visibility`).send({ hidden: true });
        expect(hidden.status).toBe(200);
        expect(hidden.body).toMatchObject({ hidden: true, status: 'hidden' });
        expect(new Date(hidden.body.updatedAt).getTime()).toBeGreaterThanOrEqual(notice.updatedAt.getTime());
        expect((await request(app).get(`/api/noticias/${notice._id}`)).status).toBe(404);

        const featured = await agent.patch(`/api/notices/${notice._id}/visibility`).send({ hidden: false, featured: true });
        expect(featured.body).toMatchObject({ hidden: false, featured: true, status: 'published' });
        expect((await request(app).get(`/api/noticias/${notice._id}`)).status).toBe(200);
    });

    it('protects the visibility endpoint', async () => {
        const foreign = await createNotice({ user: other._id });
        const editorAgent = await loginAgent(app, editor.email);

        expect((await editorAgent.patch(`/api/notices/${foreign._id}/visibility`).send({ hidden: true })).status).toBe(404);
        expect((await Notice.findById(foreign._id)).hidden).toBe(false);

        const adminAgent = await loginAgent(app, admin.email);
        expect((await adminAgent.patch(`/api/notices/${foreign._id}/visibility`).send({})).status).toBe(400);
        expect((await adminAgent.patch(`/api/notices/${foreign._id}/visibility`).send({ title: 'x' })).status).toBe(400);
        expect((await request(app).patch(`/api/notices/${foreign._id}/visibility`).send({ hidden: true })).status).toBe(401);
    });

    it('stores the publication fields sent as multipart text and derives the display date', async () => {
        const category = await Category.create({ name: 'Avisos', slug: 'avisos' });
        const publishAt = '2099-12-01T03:00:00.000Z';
        const agent = await loginAgent(app, admin.email);

        const created = await agent.post('/api/notices')
            .field('title', 'Programada').field('description', 'Resumen')
            .field('hidden', 'false').field('featured', 'true')
            .field('publishAt', publishAt).field('category', String(category._id))
            .field('byline', 'Decanato').field('imageAlt', 'Foto del evento');
        expect(created.status).toBe(200);

        const stored = await Notice.findById(created.body._id).lean();
        expect(stored).toMatchObject({ hidden: false, featured: true, byline: 'Decanato', imageAlt: 'Foto del evento' });
        expect(String(stored.category)).toBe(String(category._id));
        expect(stored.publishAt.toISOString()).toBe(publishAt);
        // 03:00 UTC del 1 de diciembre es la noche del 30 de noviembre en Lima
        expect(stored.date.toISOString()).toBe('2099-11-30T00:00:00.000Z');
        expect((await request(app).get(`/api/noticias/${created.body._id}`)).status).toBe(404);
    });

    it('clears optional fields with empty strings and rejects unknown categories', async () => {
        const category = await Category.create({ name: 'Avisos', slug: 'avisos' });
        const notice = await createNotice({ category: category._id, byline: 'Decanato', publishAt: hoursFromNow(5) });
        const agent = await loginAgent(app, admin.email);

        const cleared = await agent.put(`/api/notices/${notice._id}`)
            .field('category', '').field('byline', '').field('publishAt', '');
        expect(cleared.status).toBe(200);
        const stored = await Notice.findById(notice._id).lean();
        expect(stored.category).toBeUndefined();
        expect(stored.byline).toBeUndefined();
        expect(stored.publishAt).toBeUndefined();

        expect((await agent.put(`/api/notices/${notice._id}`).field('category', '64b7f0c2a1b2c3d4e5f60718')).status).toBe(400);
        expect((await agent.put(`/api/notices/${notice._id}`).field('category', 'abc')).status).toBe(400);
        expect((await agent.put(`/api/notices/${notice._id}`).field('featured', 'maybe')).status).toBe(400);
    });

    it('answers 409 when the notice changed after the editor loaded it', async () => {
        const notice = await createNotice({ title: 'Original' });
        const agent = await loginAgent(app, admin.email);
        const stale = new Date(notice.updatedAt.getTime() - 1000).toISOString();

        const conflict = await agent.put(`/api/notices/${notice._id}`).field('title', 'Changed').field('baseUpdatedAt', stale);
        expect(conflict.status).toBe(409);
        expect(conflict.body.code).toBe('NOTICE_CONFLICT');
        expect((await Notice.findById(notice._id)).title).toBe('Original');

        const saved = await agent.put(`/api/notices/${notice._id}`)
            .field('title', 'Changed').field('baseUpdatedAt', notice.updatedAt.toISOString());
        expect(saved.status).toBe(200);
        expect((await Notice.findById(notice._id)).title).toBe('Changed');
    });
});

describe('categories', () => {
    it('lists categories publicly in order and with usage counts for the panel', async () => {
        const adminAgent = await loginAgent(app, admin.email);
        const first = await adminAgent.post('/api/categories').send({ name: 'Investigación' });
        expect(first.status).toBe(201);
        expect(first.body).toMatchObject({ name: 'Investigación', slug: 'investigacion', order: 0, count: 0 });
        await adminAgent.post('/api/categories').send({ name: 'Avisos' });
        await createNotice({ category: first.body._id });

        const publicList = await request(app).get('/api/categorias');
        expect(publicList.body.map((category) => category.slug)).toEqual(['investigacion', 'avisos']);
        expect(publicList.body[0]).not.toHaveProperty('count');

        const editorList = await (await loginAgent(app, editor.email)).get('/api/categories');
        expect(editorList.status).toBe(200);
        expect(editorList.body.map((category) => [category.slug, category.count])).toEqual([['investigacion', 1], ['avisos', 0]]);
        expect((await request(app).get('/api/categories')).status).toBe(401);
    });

    it('lets only admins create, rename and delete categories', async () => {
        const editorAgent = await loginAgent(app, editor.email);
        expect((await editorAgent.post('/api/categories').send({ name: 'Eventos' })).status).toBe(403);

        const adminAgent = await loginAgent(app, admin.email);
        const created = await adminAgent.post('/api/categories').send({ name: 'Avisos' });
        const id = created.body._id;
        expect((await editorAgent.patch(`/api/categories/${id}`).send({ name: 'Otro' })).status).toBe(403);
        expect((await editorAgent.delete(`/api/categories/${id}`)).status).toBe(403);

        const renamed = await adminAgent.patch(`/api/categories/${id}`).send({ name: 'Avisos y comunicados', order: 5 });
        expect(renamed.body).toMatchObject({ name: 'Avisos y comunicados', slug: 'avisos-y-comunicados', order: 5 });

        expect((await adminAgent.delete(`/api/categories/${id}`)).status).toBe(204);
        expect((await adminAgent.delete(`/api/categories/${id}`)).status).toBe(404);
        expect((await adminAgent.delete('/api/categories/not-an-id')).status).toBe(400);
    });

    it('rejects duplicates ignoring case and accents, invalid names and deleting a category in use', async () => {
        const agent = await loginAgent(app, admin.email);
        const created = await agent.post('/api/categories').send({ name: 'Investigación' });
        const other = await agent.post('/api/categories').send({ name: 'Eventos' });

        expect((await agent.post('/api/categories').send({ name: 'INVESTIGACION' })).status).toBe(409);
        expect((await agent.post('/api/categories').send({ name: 'Investigación' })).status).toBe(409);
        expect((await agent.patch(`/api/categories/${other.body._id}`).send({ name: 'investigacion' })).status).toBe(409);
        expect((await agent.post('/api/categories').send({ name: '!!' })).status).toBe(400);
        expect((await agent.post('/api/categories').send({ name: 'A' })).status).toBe(400);
        expect((await agent.post('/api/categories').send({ name: 'Valid', extra: true })).status).toBe(400);

        const notice = await createNotice({ category: created.body._id });
        expect((await agent.delete(`/api/categories/${created.body._id}`)).status).toBe(409);
        await Notice.updateOne({ _id: notice._id }, { $unset: { category: '' } });
        expect((await agent.delete(`/api/categories/${created.body._id}`)).status).toBe(204);
    });
});

describe('notice summary storage', () => {
    it('stores the description as plain text without tags or escaped entities', async () => {
        const agent = await loginAgent(app, admin.email);
        const created = await agent.post('/api/notices')
            .field('title', 'Plain text')
            .field('description', '<p>Ciencia &amp; Tecnología</p><script>alert(1)</script>');
        expect(created.status).toBe(200);
        expect(created.body.description).toBe('Ciencia & Tecnología');
    });
});
