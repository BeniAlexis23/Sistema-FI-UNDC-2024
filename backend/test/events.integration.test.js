import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createUsers, fileExists, loginAgent, startTestApp, uploadImage } from './helpers.js';

let ctx;
let app;
let Notice;
let EventSeries;
let EventEdition;
let isUploadReferenced;
let admin;
let editor;
let adminAgent;

const UNKNOWN_ID = '507f1f77bcf86cd799439011';
const DAY = 24 * 60 * 60 * 1000;
const inDays = (days) => new Date(Date.now() + days * DAY).toISOString();
const exists = (url) => fileExists(ctx.uploadDirectory, url);

const seriesBody = (extra = {}) => ({
    slug: 'jepa',
    nombre: 'Jornada de Exposición de Productos Académicos',
    sigla: 'JEPA',
    urlPermanente: 'https://jepa.episundc.pe/',
    ...extra
});

const addSeries = async (extra = {}, agent = adminAgent) => {
    const response = await agent.post('/api/event-series').send(seriesBody(extra));
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    return response.body;
};

const addEdition = async (serie, extra = {}, agent = adminAgent) => {
    const response = await agent.post('/api/event-editions').send({ serie: serie._id, numero: 1, ...extra });
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    return response.body;
};

const featuredNumbers = async (serie) => (await EventEdition.find({ serie: serie._id, destacada: true }).lean())
    .map((edition) => edition.numero);

beforeAll(async () => {
    ctx = await startTestApp();
    ({ app, Notice } = ctx);
    ({ default: EventSeries } = await import('../src/models/eventSeries.model.js'));
    ({ default: EventEdition } = await import('../src/models/eventEdition.model.js'));
    ({ isUploadReferenced } = await import('../src/libs/mediaRefs.js'));
    await Promise.all([EventSeries.syncIndexes(), EventEdition.syncIndexes()]);
});

beforeEach(async () => {
    await Promise.all([ctx.User.deleteMany({}), Notice.deleteMany({}), EventSeries.deleteMany({}), EventEdition.deleteMany({})]);
    [admin, editor] = await createUsers(ctx.User);
    adminAgent = await loginAgent(app, admin.email);
});

afterAll(() => ctx.stop());

describe('public events', () => {
    it('lists active series in order with their current edition and hides hidden editions and inactive series', async () => {
        const jepa = await addSeries({ orden: 1 });
        const ciisic = await addSeries({ slug: 'ciisic', sigla: 'CIISIC', nombre: 'Congreso', urlPermanente: 'https://ciisic-viii.episundc.pe/', orden: 0 });
        const old = await addSeries({ slug: 'antigua', sigla: 'OLD', nombre: 'Serie retirada', activo: false });
        await addEdition(old, { numero: 1 });

        await addEdition(jepa, { numero: 7, semestre: '2026-I', fechaInicio: '2026-07-17T00:00:00-05:00', url: 'https://jepa-vii.episundc.pe/' });
        await addEdition(jepa, { numero: 8, semestre: '2026-II', destacada: true, fechaInicio: inDays(10), sede: 'Casa de la Cultura' });
        await addEdition(jepa, { numero: 9, hidden: true });
        // sin destacada: la vigente es la de mayor número entre las visibles
        await addEdition(ciisic, { numero: 7 });
        await addEdition(ciisic, { numero: 8, fechaInicio: inDays(-1), fechaFin: inDays(1) });
        await addEdition(ciisic, { numero: 10, hidden: true });

        const response = await request(app).get('/api/eventos');
        expect(response.status).toBe(200);
        expect(response.headers['cache-control']).toBe('no-cache');
        expect(response.body.map((series) => series.slug)).toEqual(['ciisic', 'jepa']);

        const [first, second] = response.body;
        expect(first).toMatchObject({ sigla: 'CIISIC', totalEdiciones: 2, actual: { numeral: 'VIII', estado: 'en_curso' } });
        expect(second).toMatchObject({
            slug: 'jepa', urlPermanente: 'https://jepa.episundc.pe/', totalEdiciones: 2,
            actual: { numero: 8, numeral: 'VIII', semestre: '2026-II', destacada: true, estado: 'proxima', sede: 'Casa de la Cultura' }
        });
        expect(second.actual).not.toHaveProperty('hidden');
        expect(second).not.toHaveProperty('activo');
    });

    it('shows a series with its visible editions newest first and only its public notices', async () => {
        const jepa = await addSeries();
        const visible = await Notice.create({ title: 'Ganadores de la JEPA', description: 'Resumen', user: admin._id, date: new Date('2026-07-18') });
        const hiddenNotice = await Notice.create({ title: 'Borrador', description: 'Resumen', user: admin._id, hidden: true });
        const scheduled = await Notice.create({ title: 'Programada', description: 'Resumen', user: admin._id, publishAt: new Date(Date.now() + DAY) });

        await addEdition(jepa, { numero: 7, noticias: [String(visible._id), String(hiddenNotice._id), String(scheduled._id)] });
        await addEdition(jepa, { numero: 8, destacada: true });
        await addEdition(jepa, { numero: 6, hidden: true });

        const response = await request(app).get('/api/eventos/JEPA');
        expect(response.status).toBe(200);
        expect(response.body.slug).toBe('jepa');
        expect(response.body.actual.numero).toBe(8);
        expect(response.body.ediciones.map((edition) => edition.numeral)).toEqual(['VIII', 'VII']);
        expect(response.body.ediciones[1].noticias).toEqual([
            { id: String(visible._id), title: 'Ganadores de la JEPA', imageUrl: null, imageAlt: '', date: '2026-07-18T00:00:00.000Z' }
        ]);
    });

    it('answers 404 for unknown or inactive series and 400 for invalid slugs', async () => {
        await addSeries({ slug: 'retirada', activo: false });
        expect((await request(app).get('/api/eventos/no-existe')).status).toBe(404);
        expect((await request(app).get('/api/eventos/retirada')).status).toBe(404);
        expect((await request(app).get('/api/eventos/mal_slug!')).status).toBe(400);
    });
});

describe('panel access', () => {
    it('is closed to anonymous users', async () => {
        const anonymous = request(app);
        const calls = [
            anonymous.get('/api/event-series'),
            anonymous.post('/api/event-series').send(seriesBody()),
            anonymous.put(`/api/event-series/${UNKNOWN_ID}`).send({ nombre: 'X' }),
            anonymous.delete(`/api/event-series/${UNKNOWN_ID}`),
            anonymous.get('/api/event-editions'),
            anonymous.post('/api/event-editions').send({ serie: UNKNOWN_ID, numero: 1 }),
            anonymous.patch(`/api/event-editions/${UNKNOWN_ID}/destacada`).send({}),
            anonymous.patch(`/api/event-editions/${UNKNOWN_ID}/visibility`).send({ hidden: true })
        ];
        for (const call of calls) expect((await call).status).toBe(401);
        expect(await EventSeries.countDocuments()).toBe(0);
    });

    it('rejects writes from another origin even with a valid session', async () => {
        const blocked = await adminAgent.post('/api/event-series').set('Origin', 'https://evil.example').send(seriesBody());
        expect(blocked.status).toBe(403);
        expect(await EventSeries.countDocuments()).toBe(0);

        const allowed = await adminAgent.post('/api/event-series').set('Origin', 'http://localhost:5173').send(seriesBody());
        expect(allowed.status).toBe(201);

        const blockedDelete = await adminAgent.delete(`/api/event-series/${allowed.body._id}`).set('Referer', 'https://evil.example/page');
        expect(blockedDelete.status).toBe(403);
        expect(await EventSeries.countDocuments()).toBe(1);
    });

    it('lets editors and admins manage series and editions, and does not cache the panel', async () => {
        const editorAgent = await loginAgent(app, editor.email);
        const series = await addSeries({}, editorAgent);
        const edition = await addEdition(series, { numero: 8, titulo: 'VIII JEPA' }, editorAgent);
        expect(String((await EventEdition.findById(edition._id).lean()).createdBy)).toBe(String(editor._id));

        const listed = await editorAgent.get('/api/event-editions').query({ serie: series._id });
        expect(listed.status).toBe(200);
        expect(listed.headers['cache-control']).toBe('no-store');
        expect(listed.body).toHaveLength(1);
        expect(listed.body[0]).toMatchObject({ numeral: 'VIII', serie: { slug: 'jepa', sigla: 'JEPA' }, hidden: false, estado: 'sin_fecha' });

        expect((await adminAgent.put(`/api/event-editions/${edition._id}`).send({ titulo: 'Cambiada por el admin' })).status).toBe(200);
        expect((await editorAgent.put(`/api/event-series/${series._id}`).send({ descripcion: 'Del editor' })).status).toBe(200);
        expect((await editorAgent.delete(`/api/event-editions/${edition._id}`)).status).toBe(204);
        expect((await editorAgent.delete(`/api/event-series/${series._id}`)).status).toBe(204);
    });
});

describe('series', () => {
    it('validates fields and keeps slugs unique', async () => {
        const invalid = await adminAgent.post('/api/event-series').send(seriesBody({ slug: 'Con Espacios', urlPermanente: 'javascript:alert(1)', color: 'azul', extra: 1 }));
        expect(invalid.status).toBe(400);

        await addSeries();
        const duplicate = await adminAgent.post('/api/event-series').send(seriesBody({ slug: 'JEPA' }));
        expect(duplicate.status).toBe(409);

        const renamed = await addSeries({ slug: 'feinfo', sigla: 'FEINFO' });
        expect((await adminAgent.put(`/api/event-series/${renamed._id}`).send({ slug: 'jepa' })).status).toBe(409);
        expect((await adminAgent.put(`/api/event-series/${renamed._id}`).send({})).status).toBe(400);
        expect((await adminAgent.put(`/api/event-series/${UNKNOWN_ID}`).send({ nombre: 'X' })).status).toBe(404);
    });

    it('refuses to delete a series that still has editions', async () => {
        const series = await addSeries();
        const edition = await addEdition(series);

        const blocked = await adminAgent.delete(`/api/event-series/${series._id}`);
        expect(blocked.status).toBe(409);
        expect(blocked.body.code).toBe('SERIES_HAS_EDITIONS');

        await adminAgent.delete(`/api/event-editions/${edition._id}`);
        expect((await adminAgent.delete(`/api/event-series/${series._id}`)).status).toBe(204);
        expect((await adminAgent.delete(`/api/event-series/${series._id}`)).status).toBe(404);
    });

    it('keeps the logo referenced while it is used and removes it when replaced', async () => {
        const first = await uploadImage(adminAgent);
        const second = await uploadImage(adminAgent);
        const series = await addSeries({ logo: first.url, logoAlt: 'Logo de la JEPA', color: '#1081ea' });
        expect(series).toMatchObject({ logo: first.url, color: '#1081ea', totalEdiciones: 0, activo: true });
        expect(await isUploadReferenced(first.url)).toBe(true);
        expect(await isUploadReferenced(first.url, { excludeSeriesId: series._id })).toBe(false);

        const updated = await adminAgent.put(`/api/event-series/${series._id}`).send({ logo: second.url });
        expect(updated.status).toBe(200);
        expect(await exists(first.url)).toBe(false);
        expect(await exists(second.url)).toBe(true);

        expect((await adminAgent.put(`/api/event-series/${series._id}`).send({ logo: '/uploads/00000000-0000-4000-8000-000000000000.webp' })).status).toBe(400);
    });
});

describe('editions', () => {
    it('computes the numeral, sanitizes the summary and validates the dates', async () => {
        const series = await addSeries();
        const edition = await addEdition(series, { numero: 8, resumen: '<p>Exposición de <b>proyectos</b></p><script>alert(1)</script>' });
        expect(edition.numeral).toBe('VIII');
        expect(edition.resumen).toBe('Exposición de proyectos');

        const renumbered = await adminAgent.put(`/api/event-editions/${edition._id}`).send({ numero: 9 });
        expect(renumbered.body.numeral).toBe('IX');
        const custom = await adminAgent.put(`/api/event-editions/${edition._id}`).send({ numeral: 'ix', numero: 10 });
        expect(custom.body).toMatchObject({ numero: 10, numeral: 'IX' });
        const reset = await adminAgent.put(`/api/event-editions/${edition._id}`).send({ numeral: '' });
        expect(reset.body.numeral).toBe('X');

        const backwards = await adminAgent.post('/api/event-editions').send({
            serie: series._id, numero: 2, fechaInicio: '2026-12-02T13:00:00-05:00', fechaFin: '2026-12-02T09:00:00-05:00'
        });
        expect(backwards.status).toBe(400);

        const dated = await addEdition(series, { numero: 3, fechaInicio: '2026-12-02T09:00:00-05:00', fechaFin: '2026-12-02T13:00:00-05:00' });
        // quitar el inicio dejaría un fin sin inicio
        expect((await adminAgent.put(`/api/event-editions/${dated._id}`).send({ fechaInicio: '' })).status).toBe(400);
        expect((await adminAgent.put(`/api/event-editions/${dated._id}`).send({ fechaFin: '2026-12-01T09:00:00-05:00' })).status).toBe(400);
        expect((await adminAgent.put(`/api/event-editions/${dated._id}`).send({ fechaInicio: '', fechaFin: '' })).status).toBe(200);

        expect((await adminAgent.post('/api/event-editions').send({ serie: series._id, numero: 0 })).status).toBe(400);
        expect((await adminAgent.post('/api/event-editions').send({ serie: series._id, numero: 4, semestre: '2026-3' })).status).toBe(400);
        expect((await adminAgent.post('/api/event-editions').send({ serie: UNKNOWN_ID, numero: 4 })).status).toBe(400);
        expect((await adminAgent.post('/api/event-editions').send({ serie: series._id, numero: 4, noticias: [UNKNOWN_ID] })).status).toBe(400);
    });

    it('rejects a repeated edition number in the same series', async () => {
        const series = await addSeries();
        const other = await addSeries({ slug: 'ciisic', sigla: 'CIISIC' });
        await addEdition(series, { numero: 8 });
        await addEdition(other, { numero: 8 });

        const duplicate = await adminAgent.post('/api/event-editions').send({ serie: series._id, numero: 8 });
        expect(duplicate.status).toBe(409);
        expect(duplicate.body.code).toBe('EDITION_NUMBER_TAKEN');
    });

    it('keeps at most one featured edition per series', async () => {
        const jepa = await addSeries();
        const ciisic = await addSeries({ slug: 'ciisic', sigla: 'CIISIC' });
        const seventh = await addEdition(jepa, { numero: 7, destacada: true });
        const eighth = await addEdition(jepa, { numero: 8, destacada: true });
        const ciisicEdition = await addEdition(ciisic, { numero: 8, destacada: true });
        expect(await featuredNumbers(jepa)).toEqual([8]);
        expect(await featuredNumbers(ciisic)).toEqual([8]);

        const patched = await adminAgent.patch(`/api/event-editions/${seventh._id}/destacada`).send({});
        expect(patched.status).toBe(200);
        expect(patched.body.map((edition) => [edition.numero, edition.destacada])).toEqual([[8, false], [7, true]]);
        expect(await featuredNumbers(jepa)).toEqual([7]);
        expect(await featuredNumbers(ciisic)).toEqual([8]);

        await adminAgent.put(`/api/event-editions/${eighth._id}`).send({ destacada: true });
        expect(await featuredNumbers(jepa)).toEqual([8]);

        // moverla a otra serie también le quita la marca a la destacada de esa serie
        await adminAgent.put(`/api/event-editions/${eighth._id}`).send({ serie: ciisic._id, numero: 9 });
        expect(await featuredNumbers(ciisic)).toEqual([9]);
        expect((await EventEdition.findById(ciisicEdition._id).lean()).destacada).toBe(false);

        const unset = await adminAgent.patch(`/api/event-editions/${eighth._id}/destacada`).send({ destacada: false });
        expect(unset.status).toBe(200);
        expect(await featuredNumbers(ciisic)).toEqual([]);

        // el índice parcial único es la última barrera ante pedidos cruzados
        await adminAgent.patch(`/api/event-editions/${seventh._id}/destacada`).send({ destacada: true });
        expect(await featuredNumbers(jepa)).toEqual([7]);
        await expect(EventEdition.create({ serie: jepa._id, numero: 20, numeral: 'XX', destacada: true })).rejects.toThrow(/duplicate key/);
        expect((await adminAgent.patch(`/api/event-editions/${UNKNOWN_ID}/destacada`).send({})).status).toBe(404);
    });

    it('hides and shows an edition', async () => {
        const series = await addSeries();
        const edition = await addEdition(series, { numero: 8 });

        const hidden = await adminAgent.patch(`/api/event-editions/${edition._id}/visibility`).send({ hidden: true });
        expect(hidden.status).toBe(200);
        expect(hidden.body.hidden).toBe(true);
        expect((await request(app).get('/api/eventos')).body[0]).toMatchObject({ actual: null, totalEdiciones: 0 });

        await adminAgent.patch(`/api/event-editions/${edition._id}/visibility`).send({ hidden: false });
        expect((await request(app).get('/api/eventos')).body[0].actual.numeral).toBe('VIII');
        expect((await adminAgent.patch(`/api/event-editions/${edition._id}/visibility`).send({})).status).toBe(400);
        expect((await adminAgent.patch(`/api/event-editions/${UNKNOWN_ID}/visibility`).send({ hidden: true })).status).toBe(404);
    });

    it('keeps a referenced cover out of garbage collection and removes it when nobody uses it', async () => {
        const series = await addSeries();
        const cover = await uploadImage(adminAgent);
        const replacement = await uploadImage(adminAgent);
        const edition = await addEdition(series, { numero: 8, portada: cover.url, portadaAlt: 'Afiche de la VIII JEPA' });
        expect(edition.portada).toBe(cover.url);
        expect(await isUploadReferenced(cover.url)).toBe(true);
        expect(await isUploadReferenced(cover.url, { excludeEditionId: edition._id })).toBe(false);

        // otra edición que usa la misma portada la mantiene viva aunque la primera la cambie
        const sibling = await addEdition(series, { numero: 7, portada: cover.url });
        await adminAgent.put(`/api/event-editions/${edition._id}`).send({ portada: replacement.url });
        expect(await exists(cover.url)).toBe(true);

        await adminAgent.delete(`/api/event-editions/${sibling._id}`);
        expect(await exists(cover.url)).toBe(false);

        await adminAgent.put(`/api/event-editions/${edition._id}`).send({ portada: '' });
        expect(await exists(replacement.url)).toBe(false);
    });
});
