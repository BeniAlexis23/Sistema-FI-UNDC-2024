import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'fs/promises';
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
let uploadDirectory;
let admin;
let editor;
let otherEditor;
const password = 'ValidPassword123!';
// PNG válido de 1x1: las subidas se decodifican con sharp, que rechaza imágenes corruptas
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC', 'base64');

const loginAgent = async (email, loginPassword = password) => {
    const agent = request.agent(app);
    const response = await agent.post('/api/login').send({ email, password: loginPassword });
    expect(response.status).toBe(200);
    return { agent, response };
};

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    uploadDirectory = await mkdtemp(path.join(tmpdir(), 'fi-undc-uploads-'));
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_LOCAL = mongo.getUri();
    process.env.JWT_SECRET = 'integration-test-secret-with-more-than-32-characters';
    process.env.APP_ORIGIN = 'http://localhost:5173';
    process.env.UPLOAD_DIR = uploadDirectory;
    process.env.MAX_UPLOAD_SIZE_MB = '1';

    ({ default: app } = await import('../src/app.js'));
    ({ default: User } = await import('../src/models/user.model.js'));
    ({ default: Notice } = await import('../src/models/notice.model.js'));
    await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Notice.deleteMany({})]);
    const passwordHash = await bcrypt.hash(password, 4);
    [admin, editor, otherEditor] = await User.create([
        { username: 'Admin', email: 'admin@undc.edu.pe', password: passwordHash, role: 'admin', active: true },
        { username: 'Editor', email: 'editor@undc.edu.pe', password: passwordHash, role: 'editor', active: true },
        { username: 'Other', email: 'other@undc.edu.pe', password: passwordHash, role: 'editor', active: true }
    ]);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
    await rm(uploadDirectory, { recursive: true, force: true });
});

describe('authentication and accounts', () => {
    it('does not expose public registration and sets a protected session cookie', async () => {
        expect((await request(app).post('/api/register').send({})).status).toBe(404);
        const { response } = await loginAgent(admin.email);
        const cookie = response.headers['set-cookie'][0];
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('SameSite=Strict');
        expect(response.body).toMatchObject({ role: 'admin', active: true, passwordChangeRequired: false });
    });

    it('returns the same authentication error for unknown, inactive and wrong-password accounts', async () => {
        await User.updateOne({ _id: editor._id }, { active: false });
        const attempts = [
            { email: 'missing@undc.edu.pe', password },
            { email: editor.email, password },
            { email: admin.email, password: 'WrongPassword123!' }
        ];
        for (const credentials of attempts) {
            const response = await request(app).post('/api/login').send(credentials);
            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'Invalid credentials' });
        }
    });

    it('forces a temporary-password user to change it before using protected resources', async () => {
        await User.updateOne({ _id: editor._id }, { passwordChangeRequired: true });
        const { agent } = await loginAgent(editor.email);
        const blocked = await agent.get('/api/notices');
        expect(blocked.status).toBe(403);
        expect(blocked.body.code).toBe('PASSWORD_CHANGE_REQUIRED');

        const changed = await agent.post('/api/change-password').send({
            currentPassword: password,
            newPassword: 'DifferentPassword456!'
        });
        expect(changed.status).toBe(200);
        expect(changed.body.passwordChangeRequired).toBe(false);
        expect((await agent.get('/api/notices')).status).toBe(200);
    });

    it('allows only admins to manage users and preserves the last active admin', async () => {
        const { agent: editorAgent } = await loginAgent(editor.email);
        expect((await editorAgent.get('/api/users')).status).toBe(403);

        const { agent: adminAgent } = await loginAgent(admin.email);
        const created = await adminAgent.post('/api/users').send({
            username: 'New Editor', email: 'new@undc.edu.pe', password: 'Temporary123!', role: 'editor'
        });
        expect(created.status).toBe(201);
        expect(created.body).toMatchObject({ role: 'editor', active: true, passwordChangeRequired: true });

        const demotion = await adminAgent.patch(`/api/users/${admin._id}`).send({ role: 'editor' });
        expect(demotion.status).toBe(409);
    });
});

describe('resource authorization and validation', () => {
    it('prevents an editor from reading, updating or deleting another editor resource', async () => {
        const foreignNotice = await Notice.create({ title: 'Foreign', description: 'Content', user: otherEditor._id });
        const { agent } = await loginAgent(editor.email);
        expect((await agent.get(`/api/notices/${foreignNotice._id}`)).status).toBe(404);
        expect((await agent.put(`/api/notices/${foreignNotice._id}`).send({ title: 'Hacked' })).status).toBe(404);
        expect((await agent.delete(`/api/notices/${foreignNotice._id}`)).status).toBe(404);
        expect((await Notice.findById(foreignNotice._id)).title).toBe('Foreign');
    });

    it('allows an admin to manage content from any owner', async () => {
        const foreignNotice = await Notice.create({ title: 'Foreign', description: 'Content', user: otherEditor._id });
        const { agent } = await loginAgent(admin.email);
        expect((await agent.get(`/api/notices/${foreignNotice._id}`)).status).toBe(200);
        expect((await agent.put(`/api/notices/${foreignNotice._id}`).send({ title: 'Updated' })).status).toBe(200);
        expect((await agent.delete(`/api/notices/${foreignNotice._id}`)).status).toBe(204);
    });

    it('rejects invalid identifiers and additional fields', async () => {
        const { agent } = await loginAgent(editor.email);
        expect((await agent.get('/api/notices/not-an-id')).status).toBe(400);
        const invalid = await agent.post('/api/rcfs').send({
            title: 'RCF', description: 'Text', url: 'https://undc.edu.pe/file', unexpected: true
        });
        expect(invalid.status).toBe(400);
    });
});

describe('image uploads and sanitization', () => {
    it('stores a verified image, sanitizes HTML and removes the image with the notice', async () => {
        const { agent } = await loginAgent(editor.email);
        const created = await agent.post('/api/notices')
            .field('title', 'Safe notice')
            .field('description', '<p>Allowed</p><script>alert(1)</script>')
            .attach('imageUrl', png, { filename: 'pixel.png', contentType: 'image/png' });
        expect(created.status).toBe(200);
        expect(created.body.description).not.toContain('<script>');
        const imagePath = path.join(uploadDirectory, path.basename(created.body.imageUrl));
        expect((await readFile(imagePath)).length).toBeGreaterThan(0);

        expect((await agent.delete(`/api/notices/${created.body._id}`)).status).toBe(204);
        await expect(readFile(imagePath)).rejects.toMatchObject({ code: 'ENOENT' });
    });

    it('rejects MIME spoofing and oversized images', async () => {
        const { agent } = await loginAgent(editor.email);
        const spoofed = await agent.post('/api/notices')
            .field('title', 'Spoofed')
            .field('description', 'Description')
            .attach('imageUrl', png, { filename: 'fake.jpg', contentType: 'image/jpeg' });
        expect(spoofed.status).toBe(415);

        const oversized = await agent.post('/api/notices')
            .field('title', 'Large')
            .field('description', 'Description')
            .attach('imageUrl', Buffer.alloc(1024 * 1024 + 1), { filename: 'large.png', contentType: 'image/png' });
        expect(oversized.status).toBe(413);
    });
});
