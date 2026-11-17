import 'dotenv/config';
import { readdir, stat, unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { collectMediaUrls } from '../src/libs/mediaUrls.js';

/* Barre las subidas que ninguna noticia, diapositiva de la portada ni evento (logo de serie o portada de edición) usa (por ejemplo, fotos subidas al editor y nunca guardadas).
   Por defecto solo informa; con --apply las borra. Solo toca archivos con más de GC_MIN_AGE_HOURS (48)
   para no borrar lo que alguien está subiendo ahora. */

const apply = process.argv.includes('--apply');
const minAgeHours = Number(process.env.GC_MIN_AGE_HOURS || 48);
const isProduction = process.env.NODE_ENV === 'production';
const mongoUri = isProduction ? process.env.MONGODB_URI : process.env.MONGODB_LOCAL || process.env.MONGODB_URI;
const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.resolve(process.env.UPLOAD_DIR || path.join(scriptsDirectory, '..', 'src', 'uploads'));

if (!mongoUri) throw new Error('MONGODB_URI (or MONGODB_LOCAL outside production) is required');
if (!Number.isFinite(minAgeHours) || minAgeHours < 1) throw new Error('GC_MIN_AGE_HOURS must be at least 1');

const THUMB_SUFFIX = /-480\.webp$/;
const formatMegabytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const run = async () => {
    await mongoose.connect(mongoUri);
    const notices = await mongoose.connection.collection('notices')
        .find({}).project({ imageUrl: 1, mediaRefs: 1, content: 1 }).toArray();

    const slides = await mongoose.connection.collection('heroslides')
        .find({}).project({ image: 1, imageMobile: 1 }).toArray();

    // nombres de colección fijados en models/eventSeries.model.js y models/eventEdition.model.js
    const eventSeries = await mongoose.connection.collection('eventseries')
        .find({}).project({ logo: 1 }).toArray();
    const eventEditions = await mongoose.connection.collection('eventeditions')
        .find({}).project({ portada: 1 }).toArray();

    const referenced = new Set();
    for (const notice of notices) {
        const urls = [...collectMediaUrls(notice.imageUrl, notice.content), ...(notice.mediaRefs ?? [])];
        urls.forEach((url) => referenced.add(path.basename(url)));
    }
    for (const slide of slides) {
        [slide.image, slide.imageMobile].filter(Boolean).forEach((url) => referenced.add(path.basename(url)));
    }
    for (const series of eventSeries) if (series.logo) referenced.add(path.basename(series.logo));
    for (const edition of eventEditions) if (edition.portada) referenced.add(path.basename(edition.portada));

    const files = (await readdir(uploadsDirectory).catch(() => [])).filter((name) => !name.startsWith('.'));
    const minAgeMs = minAgeHours * 60 * 60 * 1000;
    const candidates = [];
    let recent = 0;

    for (const name of files) {
        // la miniatura <uuid>-480.webp se conserva mientras se use <uuid>.webp
        const owner = name.replace(THUMB_SUFFIX, '.webp');
        if (referenced.has(owner)) continue;

        const file = await stat(path.join(uploadsDirectory, name));
        if (!file.isFile()) continue;
        if (Date.now() - file.mtimeMs < minAgeMs) {
            recent += 1;
            continue;
        }
        candidates.push({ name, size: file.size });
    }

    const totalBytes = candidates.reduce((sum, file) => sum + file.size, 0);
    console.log(`Carpeta: ${uploadsDirectory}`);
    console.log(`Archivos: ${files.length} | referenciados por ${notices.length} noticia(s), ${slides.length} diapositiva(s) de la portada y ${eventSeries.length + eventEditions.length} serie(s)/edición(es) de eventos | recientes sin referencia (se respetan): ${recent}`);
    console.log(`Sin referencia y con más de ${minAgeHours} h: ${candidates.length} (${formatMegabytes(totalBytes)})`);
    candidates.forEach((file) => console.log(`  ${apply ? 'borrando' : 'se borraría'}: ${file.name}`));

    if (!apply) {
        console.log('Simulación: no se borró nada. Ejecuta con --apply para borrar.');
        return;
    }
    for (const file of candidates) await unlink(path.join(uploadsDirectory, file.name));
    console.log(`Se borraron ${candidates.length} archivo(s).`);
};

run()
    .catch((error) => {
        console.error(`Garbage collection failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
