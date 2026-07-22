import Rcf from '../models/rcf.model.js'
import { sanitizeRichText } from '../libs/sanitize.js';

/*obtener todas las Rcf sin tener cuenta el usuario */

export const getResoluciones = async (req, res) => {
    try {
        const resoluciones = await Rcf.find();
        res.json(resoluciones);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

/*funciones para usuario autenticado */

export const getRcfs = async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
        const rcfs = await Rcf.find(filter).populate('user', 'username email role');
        res.json(rcfs);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

export const createRcf = async (req, res) => {
    try {
        const { title, url, date } = req.body
        const description = sanitizeRichText(req.body.description);
        if (!description) return res.status(400).json(['Description cannot be empty after sanitization']);
        const newRcf = new Rcf({
            title,
            description,
            url,
            date,
            user: req.user.id
        });
        const savedRcf = await newRcf.save();
        res.json(savedRcf);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

export const getRcf = async (req, res) => {
    try {
        const filter = req.user.role === 'admin'
            ? { _id: req.params.id }
            : { _id: req.params.id, user: req.user.id };
        const rcf = await Rcf.findOne(filter).populate('user', 'username email role');
        if (!rcf) return res.status(404).json({ message: 'Rcf not found' });
        res.json(rcf);
    } catch (error) {
        return res.status(404).json({ message: 'Rcf not found' });
    }
}

export const deleteRcf = async (req, res) => {
    try {
        const filter = req.user.role === 'admin'
            ? { _id: req.params.id }
            : { _id: req.params.id, user: req.user.id };
        const rcf = await Rcf.findOneAndDelete(filter);
        if (!rcf) return res.status(404).json({ message: 'Rcf not found' });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(404).json({ message: 'Rcf not found' });
    }
}

export const updateRcf = async (req, res) => {
    try {
        const filter = req.user.role === 'admin'
            ? { _id: req.params.id }
            : { _id: req.params.id, user: req.user.id };
        const updates = { ...req.body };
        if (updates.description !== undefined) {
            updates.description = sanitizeRichText(updates.description);
            if (!updates.description) return res.status(400).json(['Description cannot be empty after sanitization']);
        }
        const rcf = await Rcf.findOneAndUpdate(filter, updates, { new: true, runValidators: true });
        if (!rcf) return res.status(404).json({ message: 'Rcf not found' });
        res.json(rcf);
    } catch (error) {
        return res.status(404).json({ message: 'Rcf not found' });
    }
}
