import { Router } from "express";
import { authRequired, requirePasswordChanged } from "../middlewares/validateToken.js";
import { getNoticias, getNoticia, getNotices, getNotice, createNotice, updateNotice, deleteNotice } from "../controllers/notices.controller.js";
import { validateParams, validateSchema } from "../middlewares/validator.middleware.js";
import { createNoticeSchema, updateNoticeSchema } from "../schemas/notices.schema.js";
import { objectIdParamsSchema } from '../schemas/common.schema.js';
import upload, { persistValidatedImage } from '../multer.js';

const router = Router();

router.get('/noticias', getNoticias);
router.get('/noticias/:id', validateParams(objectIdParamsSchema), getNoticia);

router.get('/notices', authRequired, requirePasswordChanged, getNotices);
router.get('/notices/:id', authRequired, requirePasswordChanged, validateParams(objectIdParamsSchema), getNotice);
router.post('/notices', authRequired, requirePasswordChanged, upload.single('imageUrl'), validateSchema(createNoticeSchema), persistValidatedImage, createNotice);
router.delete('/notices/:id', authRequired, requirePasswordChanged, validateParams(objectIdParamsSchema), deleteNotice);
router.put('/notices/:id', authRequired, requirePasswordChanged, validateParams(objectIdParamsSchema), upload.single('imageUrl'), validateSchema(updateNoticeSchema), persistValidatedImage, updateNotice);

export default router;
