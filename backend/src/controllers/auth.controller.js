import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import { tokenCookieClearOptions, tokenCookieOptions } from '../config.js';

const serializeUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    active: user.active,
    passwordChangeRequired: user.passwordChangeRequired,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const userFound = await User.findOne({ email: normalizedEmail });
        if (!userFound || !userFound.active) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = await createAccessToken({ id: userFound._id });

        res.cookie('token', token, tokenCookieOptions);
        res.json(serializeUser(userFound));

    } catch (error) {
        res.status(500).json({ message: 'Unable to sign in' });
    }
};

export const logout = (req, res) => {
    res.clearCookie('token', tokenCookieClearOptions);
    return res.sendStatus(200);
}

export const profile = async (req, res) => {
    return res.json(serializeUser(req.user));
};

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        const validPassword = user && await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordChangeRequired = false;
        await user.save();
        return res.json(serializeUser(user));
    } catch (error) {
        return res.status(500).json({ message: "Unable to change password" });
    }
};

export const verifyToken = (req, res) => res.json(serializeUser(req.user));
