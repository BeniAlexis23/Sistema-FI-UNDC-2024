import Rcf from '../models/rcf.model.js'

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
        const rcfs = await Rcf.find({ user: req.user.id }).populate('user');
        res.json(rcfs);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

export const createRcf = async (req, res) => {
    try {
        const { title, description, url, date } = req.body
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
        const rcf = await Rcf.findById(req.params.id).populate('user');
        if (!rcf) return res.status(404).json({ message: 'Rcf not found' });
        res.json(rcf);
    } catch (error) {
        return res.status(404).json({ message: 'Rcf not found' });
    }
}

export const deleteRcf = async (req, res) => {
    try {
        const rcf = await Rcf.findByIdAndDelete(req.params.id);
        if (!rcf) return res.status(404).json({ message: 'Rcf not found' });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(404).json({ message: 'Rcf not found' });
    }
}

export const updateRcf = async (req, res) => {
    try {
        const rcf = await Rcf.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!rcf) return res.status(404).json({ message: 'Rcf not found' });
        res.json(rcf);
    } catch (error) {
        return res.status(404).json({ message: 'Rcf not found' });
    }
}