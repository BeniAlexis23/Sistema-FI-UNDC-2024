import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import request from 'supertest';
import { expect } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const password = 'ValidPassword123!';

/* Arranca la app contra una base en memoria y un directorio de subidas temporal */
export const startTestApp = async ({ maxUploadMb = '1' } = {}) => {
    const mongo = await MongoMemoryServer.create();
    const uploadDirectory = await mkdtemp(path.join(tmpdir(), 'fi-undc-cms-'));
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_LOCAL = mongo.getUri();
    process.env.JWT_SECRET = 'integration-test-secret-with-more-than-32-characters';
    process.env.APP_ORIGIN = 'http://localhost:5173';
    process.env.UPLOAD_DIR = uploadDirectory;
    process.env.MAX_UPLOAD_SIZE_MB = maxUploadMb;

    const { default: app } = await import('../src/app.js');
    const { default: User } = await import('../src/models/user.model.js');
    const { default: Notice } = await import('../src/models/notice.model.js');
    const { default: Category } = await import('../src/models/category.model.js');
    await mongoose.connect(mongo.getUri());

    const stop = async () => {
        await mongoose.disconnect();
        await mongo.stop();
        await rm(uploadDirectory, { recursive: true, force: true });
    };
    return { app, User, Notice, Category, uploadDirectory, stop };
};

export const createUsers = async (User) => {
    const passwordHash = await bcrypt.hash(password, 4);
    return User.create([
        { username: 'Admin', email: 'admin@undc.edu.pe', password: passwordHash, role: 'admin', active: true },
        { username: 'Editor', email: 'editor@undc.edu.pe', password: passwordHash, role: 'editor', active: true },
        { username: 'Other', email: 'other@undc.edu.pe', password: passwordHash, role: 'editor', active: true }
    ]);
};

export const loginAgent = async (app, email) => {
    const agent = request.agent(app);
    const response = await agent.post('/api/login').send({ email, password });
    expect(response.status).toBe(200);
    return agent;
};
