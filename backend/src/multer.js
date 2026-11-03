import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileTypeFromBuffer } from 'file-type';
import multer from 'multer';
import sharp from 'sharp';
import { MAX_UPLOAD_BYTES, UPLOAD_DIR } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDirectory = path.resolve(UPLOAD_DIR || path.join(__dirname, 'uploads'));
const allowedTypes = new Map([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp']
]);

const MAX_IMAGE_SIDE = 2000;
const THUMB_WIDTH = 480;
const MAX_INPUT_PIXELS = 40_000_000;
const MANAGED_NAME = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.webp$/;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fieldSize: 512 * 1024, fields: 30, parts: 32 },
    fileFilter: (req, file, callback) => {
        if (!allowedTypes.has(file.mimetype)) {
            const error = new Error('Only JPEG, PNG and WebP images are allowed');
            error.status = 415;
            return callback(error);
        }
        callback(null, true);
    }
});

/* Miniatura de una imagen subida: <uuid>.webp -> <uuid>-480.webp */
export const thumbUrlFor = (url) => url.replace(/\.webp$/, `-${THUMB_WIDTH}.webp`);

/* Orienta según EXIF, elimina metadatos (incluida la ubicación GPS), limita el tamaño y genera la miniatura */
const processImage = async (buffer) => {
    const source = () => sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).rotate();
    const { data, info } = await source()
        .resize({ width: MAX_IMAGE_SIDE, height: MAX_IMAGE_SIDE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
    const thumb = await source()
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer();
    return { data, thumb, width: info.width, height: info.height };
};

const unlinkIfExists = (target) => unlink(target).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
});

export const persistValidatedImage = async (req, res, next) => {
    if (!req.file) return next();

    try {
        const detectedType = await fileTypeFromBuffer(req.file.buffer);
        const extension = detectedType && allowedTypes.get(detectedType.mime);
        if (!extension || detectedType.mime !== req.file.mimetype) {
            const error = new Error('File content does not match an allowed image type');
            error.status = 415;
            throw error;
        }

        let processed;
        try {
            processed = await processImage(req.file.buffer);
        } catch {
            const error = new Error('Image could not be processed');
            error.status = 415;
            throw error;
        }

        await mkdir(uploadsDirectory, { recursive: true });
        const name = randomUUID();
        req.file.filename = `${name}.webp`;
        req.file.path = path.join(uploadsDirectory, req.file.filename);
        req.file.thumbPath = path.join(uploadsDirectory, `${name}-${THUMB_WIDTH}.webp`);
        req.file.width = processed.width;
        req.file.height = processed.height;
        await writeFile(req.file.path, processed.data, { flag: 'wx' });
        try {
            await writeFile(req.file.thumbPath, processed.thumb, { flag: 'wx' });
        } catch (error) {
            await unlinkIfExists(req.file.path).catch(() => {});
            throw error;
        }
        delete req.file.buffer;
        next();
    } catch (error) {
        next(error);
    }
};

export const removeUploadedFile = async (file) => {
    if (!file?.path) return;
    await unlinkIfExists(file.path);
    if (file.thumbPath) await unlinkIfExists(file.thumbPath);
};

export const removeUploadByUrl = async (imageUrl) => {
    if (!imageUrl?.startsWith('/uploads/')) return;
    const filename = path.basename(imageUrl);
    await unlinkIfExists(path.join(uploadsDirectory, filename));

    const managed = MANAGED_NAME.exec(filename);
    if (managed) await unlinkIfExists(path.join(uploadsDirectory, `${managed[1]}-${THUMB_WIDTH}.webp`));
};

export default upload;
