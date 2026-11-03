import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { APP_ORIGIN, IS_PRODUCTION } from '../config.js';

const mutableMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const validateRequestOrigin = (req, res, next) => {
    if (!mutableMethods.has(req.method)) return next();

    const source = req.get('origin') || req.get('referer');
    if (!source) {
        if (!IS_PRODUCTION) return next();
        return res.status(403).json({ message: 'Request origin is required' });
    }

    try {
        if (new URL(source).origin !== APP_ORIGIN) {
            return res.status(403).json({ message: 'Request origin is not allowed' });
        }
    } catch {
        return res.status(403).json({ message: 'Request origin is not allowed' });
    }

    next();
};

const rateLimitResponse = { message: 'Too many attempts. Try again later.' };

export const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: rateLimitResponse
});

export const passwordRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: rateLimitResponse
});

/* Por usuario y no por IP (detrás de un balanceador todas las IP coinciden). Debe ir después de authRequired
   y antes de multer. 150 subidas cada 15 minutos alcanzan para varias galerías de hasta 30 fotos. */
export const mediaRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 150,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => (req.user ? String(req.user.id) : ipKeyGenerator(req.ip)),
    message: rateLimitResponse
});
