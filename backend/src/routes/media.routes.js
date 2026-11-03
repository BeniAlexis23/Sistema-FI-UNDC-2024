import { Router } from 'express';
import { authRequired, requirePasswordChanged } from '../middlewares/validateToken.js';
import { mediaRateLimit } from '../middlewares/security.js';
import { noStore } from '../middlewares/cacheControl.js';
import { uploadMedia } from '../controllers/media.controller.js';
import upload, { persistValidatedImage } from '../multer.js';

const router = Router();

router.post('/media', authRequired, requirePasswordChanged, noStore, mediaRateLimit, upload.single('file'), persistValidatedImage, uploadMedia);

export default router;
