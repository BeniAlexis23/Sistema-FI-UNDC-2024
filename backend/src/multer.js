import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileTypeFromBuffer } from 'file-type';
import multer from 'multer';
import { MAX_UPLOAD_BYTES, UPLOAD_DIR } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDirectory = path.resolve(UPLOAD_DIR || path.join(__dirname, 'uploads'));
const allowedTypes = new Map([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp']
]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
    fileFilter: (req, file, callback) => {
        if (!allowedTypes.has(file.mimetype)) {
            const error = new Error('Only JPEG, PNG and WebP images are allowed');
            error.status = 415;
            return callback(error);
        }
        callback(null, true);
    }
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

        await mkdir(uploadsDirectory, { recursive: true });
        req.file.filename = `${randomUUID()}.${extension}`;
        req.file.path = path.join(uploadsDirectory, req.file.filename);
        await writeFile(req.file.path, req.file.buffer, { flag: 'wx' });
        delete req.file.buffer;
        next();
    } catch (error) {
        next(error);
    }
};

export const removeUploadedFile = async (file) => {
    if (!file?.path) return;
    await unlink(file.path).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
    });
};

export const removeUploadByUrl = async (imageUrl) => {
    if (!imageUrl?.startsWith('/uploads/')) return;
    const filename = path.basename(imageUrl);
    const target = path.join(uploadsDirectory, filename);
    await unlink(target).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
    });
};

export default upload;
