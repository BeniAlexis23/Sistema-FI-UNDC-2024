/* Archivos subidos que usa una noticia: portada, imágenes sueltas y galerías.
   Sin dependencias para poder usarlo también desde scripts. */
export const collectMediaUrls = (imageUrl, content) => {
    const urls = new Set();
    if (imageUrl?.startsWith('/uploads/')) urls.add(imageUrl);
    for (const block of content ?? []) {
        if (block?.type === 'image' && block.url) urls.add(block.url);
        if (block?.type === 'gallery') {
            for (const image of block.images ?? []) if (image?.url) urls.add(image.url);
        }
    }
    return [...urls];
};
