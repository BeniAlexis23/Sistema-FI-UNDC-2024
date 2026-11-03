import { Router } from 'express';
import { shareNotice, shareNoticeCover } from '../controllers/share.controller.js';
import { asyncHandler } from '../libs/asyncHandler.js';

const router = Router();

router.get('/noticias/:id', asyncHandler(shareNotice));
router.get('/noticias/:id/portada.jpg', asyncHandler(shareNoticeCover));

export default router;
