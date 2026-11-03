/* El contenido público se revalida siempre (una noticia programada debe aparecer a su hora);
   el panel nunca se guarda en caché */
export const revalidate = (req, res, next) => {
    res.set('Cache-Control', 'no-cache');
    next();
};

export const noStore = (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
};
