/* Envuelve handlers async para que los errores lleguen al errorHandler de Express */
export const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};
