import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

const publicFields = 'username email role active passwordChangeRequired createdAt updatedAt';

const ensureAdminRemains = async (user, changes) => {
    const removesAdmin = user.role === 'admin' && (
        changes.role === 'editor' || changes.active === false
    );
    if (!removesAdmin) return true;

    const activeAdminCount = await User.countDocuments({ role: 'admin', active: true });
    return activeAdminCount > 1;
};

export const getUsers = async (req, res) => {
    const users = await User.find().select(publicFields).sort({ createdAt: -1 });
    return res.json(users);
};

export const createUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'Email already in use' });

    const user = await User.create({
        username,
        email,
        password: await bcrypt.hash(password, 10),
        role,
        active: true,
        passwordChangeRequired: true
    });
    return res.status(201).json(await User.findById(user._id).select(publicFields));
};

export const updateUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!await ensureAdminRemains(user, req.body)) {
        return res.status(409).json({ message: 'At least one active administrator is required' });
    }

    if (req.body.email && req.body.email !== user.email) {
        const duplicate = await User.exists({ email: req.body.email, _id: { $ne: user._id } });
        if (duplicate) return res.status(409).json({ message: 'Email already in use' });
    }

    Object.assign(user, req.body);
    await user.save();
    return res.json(await User.findById(user._id).select(publicFields));
};

export const resetPassword = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.passwordChangeRequired = true;
    await user.save();
    return res.json({ message: 'Password reset successfully' });
};
