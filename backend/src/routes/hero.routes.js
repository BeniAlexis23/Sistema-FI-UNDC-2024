import { Router } from 'express';
import {
    createSlide, deleteSlide, getHero, getSlides, reorderSlides, updateSettings, updateSlide
} from '../controllers/hero.controller.js';
import { authRequired, requirePasswordChanged, requireRole } from '../middlewares/validateToken.js';
import { noStore, revalidate } from '../middlewares/cacheControl.js';
import { validateParams, validateSchema } from '../middlewares/validator.middleware.js';
import { objectIdParamsSchema } from '../schemas/common.schema.js';
import { createSlideSchema, heroSettingsSchema, reorderSlidesSchema, updateSlideSchema } from '../schemas/hero.schema.js';
import { asyncHandler } from '../libs/asyncHandler.js';

const router = Router();
const adminOnly = [authRequired, requirePasswordChanged, requireRole('admin'), noStore];

router.get('/portada/hero', revalidate, asyncHandler(getHero));

router.get('/hero-slides', ...adminOnly, asyncHandler(getSlides));
router.post('/hero-slides', ...adminOnly, validateSchema(createSlideSchema), asyncHandler(createSlide));
// antes de /:id para que «reorder» no se tome como identificador
router.put('/hero-slides/reorder', ...adminOnly, validateSchema(reorderSlidesSchema), asyncHandler(reorderSlides));
router.put('/hero-slides/:id', ...adminOnly, validateParams(objectIdParamsSchema), validateSchema(updateSlideSchema), asyncHandler(updateSlide));
router.delete('/hero-slides/:id', ...adminOnly, validateParams(objectIdParamsSchema), asyncHandler(deleteSlide));
router.put('/hero-settings', ...adminOnly, validateSchema(heroSettingsSchema), asyncHandler(updateSettings));

export default router;
