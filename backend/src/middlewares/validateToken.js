import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import User from '../models/user.model.js';

export const authRequired = (req, res, next) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    jwt.verify(token, JWT_SECRET, async (err, payload) => {
        if (err) return res.status(403).json({ message: "Invalid token" });

        try {
            const user = await User.findById(payload.id).select('-password');
            if (!user || !user.active) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            req.user = user;
            next();
        } catch (error) {
            next(error);
        }
    });
}

export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};

export const requirePasswordChanged = (req, res, next) => {
    if (req.user?.passwordChangeRequired) {
        return res.status(403).json({
            message: "Password change required",
            code: "PASSWORD_CHANGE_REQUIRED"
        });
    }
    next();
};
