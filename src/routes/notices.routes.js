import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { getNotices, getNotice, createNotice, updateNotice, deleteNotice } from "../controllers/notices.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { createNoticeSchema } from "../schemas/notices.schema.js";

const router = Router();

router.get('/notices', authRequired, getNotices)
router.get('/notices/:id', authRequired, getNotice)
router.post('/notices', authRequired, validateSchema(createNoticeSchema), createNotice)
router.delete('/notices/:id', authRequired, deleteNotice)
router.put('/notices/:id', authRequired, updateNotice)

export default router