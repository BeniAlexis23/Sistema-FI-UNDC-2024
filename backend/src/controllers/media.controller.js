import { thumbUrlFor } from '../multer.js';

/* Subida inmediata desde el editor: devuelve la URL para guardarla dentro de la noticia */
export const uploadMedia = (req, res) => {
    if (!req.file) return res.status(400).json(['Image file is required']);

    const url = `/uploads/${req.file.filename}`;
    return res.status(201).json({
        url,
        thumbUrl: thumbUrlFor(url),
        width: req.file.width,
        height: req.file.height
    });
};
