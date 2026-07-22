export const getApiErrors = (error, fallback = 'Ocurrió un error inesperado') => {
    const data = error.response?.data;
    if (Array.isArray(data)) return data;
    if (data?.message) return [data.message];
    return [fallback];
};
