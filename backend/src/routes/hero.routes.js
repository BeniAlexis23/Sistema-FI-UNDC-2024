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
/* Hay una sola portada para todo el sitio: la administran administradores y editores. La lectura pública no pide sesión */
const panelAccess = [authRequired, requirePasswordChanged, requireRole('admin', 'editor'), noStore];

router.get('/portada/hero', revalidate, asyncHandler(getHero));

router.get('/hero-slides', ...panelAccess, asyncHandler(getSlides));
router.post('/hero-slides', ...panelAccess, validateSchema(createSlideSchema), asyncHandler(createSlide));
// antes de /:id para que «reorder» no se tome como identificador
router.put('/hero-slides/reorder', ...panelAccess, validateSchema(reorderSlidesSchema), asyncHandler(reorderSlides));
router.put('/hero-slides/:id', ...panelAccess, validateParams(objectIdParamsSchema), validateSchema(updateSlideSchema), asyncHandler(updateSlide));
router.delete('/hero-slides/:id', ...panelAccess, validateParams(objectIdParamsSchema), asyncHandler(deleteSlide));
router.put('/hero-settings', ...panelAccess, validateSchema(heroSettingsSchema), asyncHandler(updateSettings));

export default router;
