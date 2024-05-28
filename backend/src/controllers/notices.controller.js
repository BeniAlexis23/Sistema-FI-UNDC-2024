import Notice from '../models/notice.model.js'

/*obtener todas las Noticias sin tener cuenta el usuario */

export const getNoticias = async (req, res) => {
    try {
        const noticias = await Notice.find();
        res.json(noticias);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

/*funciones para usuario autenticado */

export const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find({ user: req.user.id }).populate('user');
        res.json(notices);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

export const createNotice = async (req, res) => {
    try {
        const { title, description, imageUrl, date } = req.body
        const newNotice = new Notice({
            title,
            description,
            imageUrl,
            date,
            user: req.user.id
        });
        const savedNotice = await newNotice.save();
        res.json(savedNotice);
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
};

export const getNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id).populate('user');
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json(notice);
    } catch (error) {
        return res.status(404).json({ message: 'Notice not found' });
    }
}

export const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findByIdAndDelete(req.params.id);
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        return res.sendStatus(204);
    } catch (error) {
        return res.status(404).json({ message: 'Notice not found' });
    }
}

export const updateNotice = async (req, res) => {
    try {
        const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json(notice);
    } catch (error) {
        return res.status(404).json({ message: 'Notice not found' });
    }
}