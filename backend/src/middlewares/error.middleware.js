import multer from 'multer';

export const notFound = (req, res) => {
    res.status(404).json({ message: 'Route not found' });
};

export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error instanceof multer.MulterError) {
        const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        const message = error.code === 'LIMIT_FILE_SIZE'
            ? 'Uploaded image is too large'
            : 'Invalid file upload';
        return res.status(status).json({ message });
    }

    if (error.status && error.status >= 400 && error.status < 500) {
        return res.status(error.status).json({ message: error.message });
    }

    if (error.code === 11000) {
        return res.status(409).json({ message: 'Resource already exists' });
    }

    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid request data' });
    }

    console.error('Unhandled request error', {
        method: req.method,
        path: req.originalUrl,
        name: error.name
    });
    return res.status(500).json({ message: 'Internal server error' });
};
