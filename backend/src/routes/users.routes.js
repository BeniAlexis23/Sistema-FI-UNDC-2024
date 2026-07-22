import { Router } from 'express';
import { createUser, getUsers, resetPassword, updateUser } from '../controllers/users.controller.js';
import { authRequired, requirePasswordChanged, requireRole } from '../middlewares/validateToken.js';
import { validateParams, validateSchema } from '../middlewares/validator.middleware.js';
import { createUserSchema, resetPasswordSchema, updateUserSchema } from '../schemas/users.schema.js';
import { passwordRateLimit } from '../middlewares/security.js';
import { objectIdParamsSchema } from '../schemas/common.schema.js';

const router = Router();
const adminOnly = [authRequired, requirePasswordChanged, requireRole('admin')];
const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

router.get('/users', ...adminOnly, asyncHandler(getUsers));
router.post('/users', ...adminOnly, validateSchema(createUserSchema), asyncHandler(createUser));
router.patch('/users/:id', ...adminOnly, validateParams(objectIdParamsSchema), validateSchema(updateUserSchema), asyncHandler(updateUser));
router.post('/users/:id/reset-password', passwordRateLimit, ...adminOnly, validateParams(objectIdParamsSchema), validateSchema(resetPasswordSchema), asyncHandler(resetPassword));

export default router;
