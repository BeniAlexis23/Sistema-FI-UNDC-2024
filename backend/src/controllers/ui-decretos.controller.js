import Decreto from '../models/decreto.model.js'

/*obtener todos los decretos sin tener cuenta el usuario */

export const getUIDecretos = async (req, res) => {
    try {
        const uidecretos = await Decreto.find();
        res.json(uidecretos);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

/*funciones para usuario autenticado */

export const getDecretos = async (req, res) => {
    try {
        const decretos = await Decreto.find({ user: req.user.id }).populate('user');
        res.json(decretos);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

export const createDecreto = async (req, res) => {
    try {
        const { title, description, url, date } = req.body
        const newDecreto = new Decreto({
            title,
            description,
            url,
            date,
            user: req.user.id
        });
        const savedDecreto = await newDecreto.save();
        res.json(savedDecreto);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

export const getDecreto = async (req, res) => {
    try {
        const decreto = await Decreto.findById(req.params.id).populate('user');
        if (!decreto) return res.status(404).json({ message: 'Decreto not found' });
        res.json(decreto);
    } catch (error) {
        return res.status(404).json({ message: 'Decreto not found' });
    }
}

export const deleteDecreto = async (req, res) => {
    try {
        const decreto = await Decreto.findByIdAndDelete(req.params.id);
        if (!decreto) return res.status(404).json({ message: 'Decreto not found' });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(404).json({ message: 'Decreto not found' });
    }
}

export const updateDecreto = async (req, res) => {
    try {
        const decreto = await Decreto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!decreto) return res.status(404).json({ message: 'Decreto not found' });
        res.json(decreto);
    } catch (error) {
        return res.status(404).json({ message: 'Decreto not found' });
    }
}