import multer from 'multer';

const tooLargeUploadCodes = new Set([
    'LIMIT_FILE_SIZE', 'LIMIT_FIELD_VALUE', 'LIMIT_FIELD_KEY', 'LIMIT_FIELD_COUNT', 'LIMIT_PART_COUNT'
]);

export const notFound = (req, res) => {
    res.status(404).json({ message: 'Route not found' });
};

export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error instanceof multer.MulterError) {
        const tooLarge = tooLargeUploadCodes.has(error.code);
        const message = error.code === 'LIMIT_FILE_SIZE'
            ? 'Uploaded image is too large'
            : tooLarge ? 'Request is too large' : 'Invalid file upload';
        return res.status(tooLarge ? 413 : 400).json({ message });
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
