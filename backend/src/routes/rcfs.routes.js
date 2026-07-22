import { Router } from "express";
import { authRequired, requirePasswordChanged } from "../middlewares/validateToken.js";
import { getResoluciones, getRcfs, getRcf, createRcf, updateRcf, deleteRcf } from "../controllers/rcfs.controller.js";
import { validateParams, validateSchema } from "../middlewares/validator.middleware.js";
import { createRcfSchema, updateRcfSchema } from "../schemas/rcfs.schema.js";
import { objectIdParamsSchema } from '../schemas/common.schema.js';

const router = Router();

router.get('/resoluciones', getResoluciones)

router.get('/rcfs', authRequired, requirePasswordChanged, getRcfs)
router.get('/rcfs/:id', authRequired, requirePasswordChanged, validateParams(objectIdParamsSchema), getRcf)
router.post('/rcfs', authRequired, requirePasswordChanged, validateSchema(createRcfSchema), createRcf)
router.delete('/rcfs/:id', authRequired, requirePasswordChanged, validateParams(objectIdParamsSchema), deleteRcf)
router.put('/rcfs/:id', authRequired, requirePasswordChanged, validateParams(objectIdParamsSchema), validateSchema(updateRcfSchema), updateRcf)

export default router
