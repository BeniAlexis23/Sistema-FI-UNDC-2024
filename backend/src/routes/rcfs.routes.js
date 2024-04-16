import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { getResoluciones, getRcfs, getRcf, createRcf, updateRcf, deleteRcf } from "../controllers/rcfs.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { createRcfSchema } from "../schemas/rcfs.schema.js";

const router = Router();

router.get('/resoluciones', getResoluciones)

router.get('/rcfs', authRequired, getRcfs)
router.get('/rcfs/:id', authRequired, getRcf)
router.post('/rcfs', authRequired, validateSchema(createRcfSchema), createRcf)
router.delete('/rcfs/:id', authRequired, deleteRcf)
router.put('/rcfs/:id', authRequired, updateRcf)

export default router