import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { getUIDecretos, getDecretos, getDecreto, createDecreto, updateDecreto, deleteDecreto } from "../controllers/ui-decretos.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { createDecretoSchema } from "../schemas/decretos.schema.js";

const router = Router();

router.get('/investigacion', getUIDecretos)

router.get('/decretos', authRequired, getDecretos)
router.get('/decretos/:id', authRequired, getDecreto)
router.post('/decretos', authRequired, validateSchema(createDecretoSchema), createDecreto)
router.delete('/decretos/:id', authRequired, deleteDecreto)
router.put('/decretos/:id', authRequired, updateDecreto)

export default router