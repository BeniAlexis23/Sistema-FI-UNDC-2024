import { Router } from 'express';
import {
    createEdition, createSeries, deleteEdition, deleteSeries, getEdition, getEditions, getEvento, getEventos,
    getSeries, getSeriesList, setEditionDestacada, setEditionVisibility, updateEdition, updateSeries
} from '../controllers/events.controller.js';
import { authRequired, requirePasswordChanged, requireRole } from '../middlewares/validateToken.js';
import { noStore, revalidate } from '../middlewares/cacheControl.js';
import { validateParams, validateQuery, validateSchema } from '../middlewares/validator.middleware.js';
import { objectIdParamsSchema } from '../schemas/common.schema.js';
import {
    createEditionSchema, createSeriesSchema, editionDestacadaSchema, editionsQuerySchema, editionVisibilitySchema,
    eventSlugParamsSchema, updateEditionSchema, updateSeriesSchema
} from '../schemas/events.schema.js';
import { asyncHandler } from '../libs/asyncHandler.js';

const router = Router();
/* El catálogo de eventos es uno solo para toda la facultad: lo administran administradores y editores.
   La lectura pública no pide sesión */
const panelAccess = [authRequired, requirePasswordChanged, requireRole('admin', 'editor'), noStore];
const byId = validateParams(objectIdParamsSchema);

router.get('/eventos', revalidate, asyncHandler(getEventos));
router.get('/eventos/:slug', revalidate, validateParams(eventSlugParamsSchema), asyncHandler(getEvento));

router.get('/event-series', ...panelAccess, asyncHandler(getSeriesList));
router.get('/event-series/:id', ...panelAccess, byId, asyncHandler(getSeries));
router.post('/event-series', ...panelAccess, validateSchema(createSeriesSchema), asyncHandler(createSeries));
router.put('/event-series/:id', ...panelAccess, byId, validateSchema(updateSeriesSchema), asyncHandler(updateSeries));
router.delete('/event-series/:id', ...panelAccess, byId, asyncHandler(deleteSeries));

router.get('/event-editions', ...panelAccess, validateQuery(editionsQuerySchema), asyncHandler(getEditions));
router.get('/event-editions/:id', ...panelAccess, byId, asyncHandler(getEdition));
router.post('/event-editions', ...panelAccess, validateSchema(createEditionSchema), asyncHandler(createEdition));
router.put('/event-editions/:id', ...panelAccess, byId, validateSchema(updateEditionSchema), asyncHandler(updateEdition));
router.delete('/event-editions/:id', ...panelAccess, byId, asyncHandler(deleteEdition));
router.patch('/event-editions/:id/destacada', ...panelAccess, byId, validateSchema(editionDestacadaSchema), asyncHandler(setEditionDestacada));
router.patch('/event-editions/:id/visibility', ...panelAccess, byId, validateSchema(editionVisibilitySchema), asyncHandler(setEditionVisibility));

export default router;
