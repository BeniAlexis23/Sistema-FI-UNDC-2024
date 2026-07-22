export const validateSchema = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        if (!error.errors) return next(error);
        return res.status(400).json(error.errors.map((issue) => issue.message));
    }
};

export const validateParams = (schema) => (req, res, next) => {
    try {
        req.params = schema.parse(req.params);
        next();
    } catch (error) {
        if (!error.errors) return next(error);
        return res.status(400).json(error.errors.map((issue) => issue.message));
    }
};
