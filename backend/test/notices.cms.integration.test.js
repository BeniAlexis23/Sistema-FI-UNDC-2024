import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo;
let app;
let User;
let Notice;
let Category;
let uploadDirectory;
let admin;
const password = 'ValidPassword123!';

const day = (offset) => new Date(Date.UTC(2026, 0, 1 + offset));
const hoursFromNow = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);
const titles = (response) => response.body.map((notice) => notice.title);

const loginAgent = async (email) => {
    const agent = request.agent(app);
    const response = await agent.post('/api/login').send({ email, password });
    expect(response.status).toBe(200);
    return agent;
};

const createNotice = (fields = {}) => Notice.create({
    title: 'Noticia', description: 'Texto', user: admin._id, ...fields
});

/* Documento legado: creado antes de los campos hidden, publishAt, featured, category y content */
const insertLegacyNotice = async (fields = {}) => {
    const { insertedId } = await Notice.collection.insertOne({
        title: 'Legacy', description: 'Texto legado', date: day(5), user: admin._id,
        createdAt: new Date(), updatedAt: new Date(), ...fields
    });
    return insertedId;
};

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    uploadDirectory = await mkdtemp(path.join(tmpdir(), 'fi-undc-cms-'));
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_LOCAL = mongo.getUri();
    process.env.JWT_SECRET = 'integration-test-secret-with-more-than-32-characters';
    process.env.APP_ORIGIN = 'http://localhost:5173';
    process.env.UPLOAD_DIR = uploadDirectory;
    process.env.MAX_UPLOAD_SIZE_MB = '1';

    ({ default: app } = await import('../src/app.js'));
    ({ default: User } = await import('../src/models/user.model.js'));
    ({ default: Notice } = await import('../src/models/notice.model.js'));
    ({ default: Category } = await import('../src/models/category.model.js'));
    await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Notice.deleteMany({}), Category.deleteMany({})]);
    admin = await User.create({
        username: 'Admin', email: 'admin@undc.edu.pe', password: await bcrypt.hash(password, 4), role: 'admin', active: true
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
    await rm(uploadDirectory, { recursive: true, force: true });
});

describe('public notices visibility', () => {
    it('hides hidden and scheduled notices, sorts by date and omits content and user', async () => {
        await createNotice({ title: 'Oldest', date: day(0) });
        await createNotice({ title: 'Newest', date: day(30) });
        await createNotice({ title: 'Hidden', date: day(40), hidden: true });
        await createNotice({ title: 'Scheduled', date: day(41), publishAt: hoursFromNow(2) });
        await createNotice({ title: 'Released', date: day(15), publishAt: hoursFromNow(-2) });
        await insertLegacyNotice({ date: day(10) });

        const response = await request(app).get('/api/noticias');
        expect(response.status).toBe(200);
        expect(titles(response)).toEqual(['Newest', 'Released', 'Legacy', 'Oldest']);
        for (const notice of response.body) {
            expect(notice).not.toHaveProperty('content');
            expect(notice).not.toHaveProperty('user');
        }
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
        expect((await request(app).get('/api/noticias?category=no-existe')).body).toEqual([]);
        expect((await request(app).get('/api/noticias?limit=500')).status).toBe(400);
    });

    it('computes a reading time for notices that do not store one', async () => {
        await createNotice({ description: Array.from({ length: 450 }, () => 'palabra').join(' ') });
        const response = await request(app).get('/api/noticias');
        expect(response.body[0].readingMinutes).toBe(3);
    });
});

describe('notice summary storage', () => {
    it('stores the description as plain text without tags or escaped entities', async () => {
        const agent = await loginAgent(admin.email);
        const created = await agent.post('/api/notices')
            .field('title', 'Plain text')
            .field('description', '<p>Ciencia &amp; Tecnología</p><script>alert(1)</script>');
        expect(created.status).toBe(200);
        expect(created.body.description).toBe('Ciencia & Tecnología');
    });
});
