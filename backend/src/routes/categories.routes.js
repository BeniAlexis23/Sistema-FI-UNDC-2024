import { Router } from 'express';
import { createCategory, deleteCategory, getCategories, getCategorias, updateCategory } from '../controllers/categories.controller.js';
import { authRequired, requirePasswordChanged, requireRole } from '../middlewares/validateToken.js';
import { validateParams, validateSchema } from '../middlewares/validator.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/categories.schema.js';
import { objectIdParamsSchema } from '../schemas/common.schema.js';
import { asyncHandler } from '../libs/asyncHandler.js';

const router = Router();
const authenticated = [authRequired, requirePasswordChanged];
const adminOnly = [...authenticated, requireRole('admin')];
// el editor crea la categoría desde la propia noticia; renombrar, ordenar y eliminar siguen siendo del admin
const canCreate = [...authenticated, requireRole('admin', 'editor')];

router.get('/categorias', asyncHandler(getCategorias));

router.get('/categories', ...authenticated, asyncHandler(getCategories));
router.post('/categories', ...canCreate, validateSchema(createCategorySchema), asyncHandler(createCategory));
router.patch('/categories/:id', ...adminOnly, validateParams(objectIdParamsSchema), validateSchema(updateCategorySchema), asyncHandler(updateCategory));
router.delete('/categories/:id', ...adminOnly, validateParams(objectIdParamsSchema), asyncHandler(deleteCategory));

export default router;
