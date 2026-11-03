import { Router } from "express";
import { authRequired, requirePasswordChanged } from "../middlewares/validateToken.js";
import {
    getNoticias, getNoticia, getNotices, getNotice, getNoticeStats, createNotice, updateNotice,
    updateNoticeVisibility, deleteNotice
} from "../controllers/notices.controller.js";
import { validateParams, validateQuery, validateSchema } from "../middlewares/validator.middleware.js";
import {
    adminNoticesQuerySchema, createNoticeSchema, noticeVisibilitySchema, publicNoticesQuerySchema, updateNoticeSchema
} from "../schemas/notices.schema.js";
import { objectIdParamsSchema } from '../schemas/common.schema.js';
import { noStore, revalidate } from '../middlewares/cacheControl.js';
import upload, { persistValidatedImage } from '../multer.js';

const router = Router();
const authenticated = [authRequired, requirePasswordChanged, noStore];

router.get('/noticias', revalidate, validateQuery(publicNoticesQuerySchema), getNoticias);
router.get('/noticias/:id', revalidate, validateParams(objectIdParamsSchema), getNoticia);

router.get('/notices', ...authenticated, validateQuery(adminNoticesQuerySchema), getNotices);
router.get('/notices/stats', ...authenticated, getNoticeStats);
router.get('/notices/:id', ...authenticated, validateParams(objectIdParamsSchema), getNotice);
router.post('/notices', ...authenticated, upload.single('imageUrl'), validateSchema(createNoticeSchema), persistValidatedImage, createNotice);
router.delete('/notices/:id', ...authenticated, validateParams(objectIdParamsSchema), deleteNotice);
router.put('/notices/:id', ...authenticated, validateParams(objectIdParamsSchema), upload.single('imageUrl'), validateSchema(updateNoticeSchema), persistValidatedImage, updateNotice);
router.patch('/notices/:id/visibility', ...authenticated, validateParams(objectIdParamsSchema), validateSchema(noticeVisibilitySchema), updateNoticeVisibility);

export default router;
