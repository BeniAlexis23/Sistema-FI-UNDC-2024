/* Convierte los banners que vienen con el sitio en diapositivas editables.
   Primero sube todas las imágenes y solo si todas salen bien crea las diapositivas: un fallo no debe dejar la portada a medias,
   porque en cuanto existe una diapositiva activa el sitio deja de mostrar los banners por defecto. */
export const importBanners = async (banners, { loadFile, upload, create, remove, onProgress }) => {
  const uploaded = [];
  for (const [index, banner] of banners.entries()) {
    onProgress?.(index, banners.length);
    uploaded.push({ banner, image: await upload(await loadFile(banner)) });
  }

  const created = [];
  try {
    for (const { banner, image } of uploaded) {
      created.push(await create({ image: image.url, alt: banner.alt }));
    }
  } catch (error) {
    await Promise.allSettled(created.map((slide) => remove(slide._id)));
    throw error;
  }
  onProgress?.(banners.length, banners.length);
  return created;
};
