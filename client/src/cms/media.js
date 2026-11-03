const MANAGED_IMAGE = /^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

/* Las subidas del editor tienen una miniatura <uuid>-480.webp; las imágenes antiguas no */
export const thumbUrl = (url) => (MANAGED_IMAGE.test(url ?? '') ? url.replace(/\.webp$/, '-480.webp') : url);
