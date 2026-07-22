import { Router } from "express";
import { changePassword, login, logout, profile, verifyToken } from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { changePasswordSchema, loginSchema } from "../schemas/auth.schema.js";
import { loginRateLimit, passwordRateLimit } from "../middlewares/security.js";

const router = Router();

router.post('/login', loginRateLimit, validateSchema(loginSchema), login);
router.post('/logout', logout);
router.get('/verify', authRequired, verifyToken);
router.get('/profile', authRequired, profile);
router.post('/change-password', passwordRateLimit, authRequired, validateSchema(changePasswordSchema), changePassword);


export default router
