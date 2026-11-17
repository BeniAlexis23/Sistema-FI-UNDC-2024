import 'dotenv/config';
import mongoose from 'mongoose';
import EventSeries from '../src/models/eventSeries.model.js';
import EventEdition from '../src/models/eventEdition.model.js';
import { toRoman } from '../src/libs/roman.js';

/* Carga el catálogo inicial de eventos (CIISIC, JEPA, FEINFO) con lo que hoy enlaza el menú.
   Es idempotente: busca las series por slug y las ediciones por (serie, número). Por defecto solo crea lo que falta
   y no toca lo que ya se editó en el panel; con --overwrite vuelve a escribir estos datos.
   Fuera de producción usa MONGODB_LOCAL; en producción exige --allow-production. */

const overwrite = process.argv.includes('--overwrite');
const allowProduction = process.argv.includes('--allow-production');
const isProduction = process.env.NODE_ENV === 'production';
const mongoUri = isProduction ? process.env.MONGODB_URI : process.env.MONGODB_LOCAL || process.env.MONGODB_URI;

if (!mongoUri) throw new Error('MONGODB_URI (or MONGODB_LOCAL outside production) is required');
if (isProduction && !allowProduction) throw new Error('Refusing to seed a production database without --allow-production');

/* Solo datos confirmados: las fechas que no se conocen se dejan vacías (el panel permite completarlas).
   Por confirmar: el dominio permanente del CIISIC y el nombre completo de la FEINFO. */
const catalog = [
    {
        series: {
            slug: 'ciisic',
            nombre: 'Congreso Internacional de Ingeniería de Sistemas e Informática',
            sigla: 'CIISIC',
            urlPermanente: 'https://ciisic-viii.episundc.pe/',
            orden: 0
        },
        editions: [
            { numero: 8, destacada: true, url: 'https://ciisic-viii.episundc.pe/' },
            { numero: 7, url: 'https://ciisic-vii.episundc.pe/' }
        ]
    },
    {
        series: {
            slug: 'jepa',
            nombre: 'Jornada de Exposición de Productos Académicos',
            sigla: 'JEPA',
            urlPermanente: 'https://jepa.episundc.pe/',
            orden: 1
        },
        editions: [
            {
                numero: 8,
                semestre: '2026-II',
                destacada: true,
                fechaInicio: '2026-12-02T09:00:00-05:00',
                fechaFin: '2026-12-02T13:00:00-05:00',
                sede: 'Casa de la Cultura – San Vicente de Cañete',
                url: 'https://jepa.episundc.pe/'
            },
            {
                numero: 7,
                semestre: '2026-I',
                // solo se conoce el día: medianoche de Lima
                fechaInicio: '2026-07-17T00:00:00-05:00',
                url: 'https://jepa-vii.episundc.pe/'
            }
        ]
    },
    {
        series: {
            slug: 'feinfo',
            nombre: 'Feria de Investigación Formativa (FEINFO)',
            sigla: 'FEINFO',
            urlPermanente: 'https://uifi.episundc.pe/',
            orden: 2
        },
        editions: [
            { numero: 4, destacada: true, url: 'https://uifi.episundc.pe/' }
        ]
    }
];

// sin título: el sitio muestra «VIII JEPA» hasta que el panel escriba uno
const editionDocument = (edition) => {
    const numeral = toRoman(edition.numero);
    return {
        numeral,
        destacada: Boolean(edition.destacada),
        hidden: false,
        ...edition,
        ...(edition.fechaInicio && { fechaInicio: new Date(edition.fechaInicio) }),
        ...(edition.fechaFin && { fechaFin: new Date(edition.fechaFin) })
    };
};

const upsert = async (Model, filter, document) => {
    const update = overwrite ? { $set: document } : { $setOnInsert: document };
    const result = await Model.updateOne(filter, update, { upsert: true, runValidators: true });
    return result.upsertedCount ? 'creada' : (overwrite && result.modifiedCount ? 'actualizada' : 'sin cambios');
};

const run = async () => {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log(`Base: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}${overwrite ? ' (--overwrite)' : ''}`);
    await Promise.all([EventSeries.syncIndexes(), EventEdition.syncIndexes()]);

    for (const { series, editions } of catalog) {
        const { slug, ...seriesFields } = series;
        const seriesStatus = await upsert(EventSeries, { slug }, { slug, activo: true, ...seriesFields });
        const stored = await EventSeries.findOne({ slug }).select('_id').lean();
        console.log(`Serie ${series.sigla}: ${seriesStatus}`);

        // las destacadas se escriben al final para no chocar con una destacada anterior de la misma serie
        const ordered = [...editions].sort((a, b) => Number(Boolean(a.destacada)) - Number(Boolean(b.destacada)));
        for (const edition of ordered) {
            const document = editionDocument(edition);
            const alreadyFeatured = document.destacada
                && await EventEdition.exists({ serie: stored._id, destacada: true, numero: { $ne: edition.numero } });
            if (alreadyFeatured && !overwrite) document.destacada = false;
            if (document.destacada) {
                await EventEdition.updateMany({ serie: stored._id, numero: { $ne: edition.numero }, destacada: true }, { $set: { destacada: false } });
            }
            const status = await upsert(EventEdition, { serie: stored._id, numero: edition.numero }, { serie: stored._id, ...document });
            console.log(`  Edición ${document.numeral}: ${status}${alreadyFeatured && !overwrite ? ' (ya había otra destacada: se respeta)' : ''}`);
        }
    }
};

run()
    .catch((error) => {
        console.error(`Seeding failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
