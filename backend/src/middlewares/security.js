import rateLimit from 'express-rate-limit';
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
