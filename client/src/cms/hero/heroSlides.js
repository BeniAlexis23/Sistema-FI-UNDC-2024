/* Convierte la respuesta de /portada/hero en lo que muestra el carrusel.
   Sin diapositivas se usan los banners que vienen con el sitio (`fallback`). */
export const buildHeroState = (data, { fallback, resolveUrl }) => {
  const slides = Array.isArray(data?.slides) ? data.slides : [];
  if (slides.length === 0) return fallback;

  const intervalSeconds = Number(data.intervalSeconds);
  return {
    source: 'api',
    intervalSeconds: intervalSeconds > 0 ? intervalSeconds : fallback.intervalSeconds,
    slides: slides.map((slide) => ({
      ...slide,
      image: resolveUrl(slide.image),
      imageMobile: slide.imageMobile ? resolveUrl(slide.imageMobile) : null,
    })),
  };
};
