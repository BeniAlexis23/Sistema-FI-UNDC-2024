export const getApiErrors = (error, fallback = 'Ocurrió un error inesperado') => {
    const data = error.response?.data;
    if (Array.isArray(data)) return data;
    if (data?.message) return [data.message];
    return [fallback];
};

// Las respuestas de la propia aplicación traen un mensaje en JSON; las de un proxy o un cortafuegos son HTML o vienen vacías
export const hasApiMessage = (data) => Array.isArray(data) || typeof data?.message === 'string';

// Un 403 que no es de la aplicación lo da un filtro del servidor (el Apache de delante), no la sesión
export const isServerFilterBlock = (error) => error.response?.status === 403 && !hasApiMessage(error.response?.data);
