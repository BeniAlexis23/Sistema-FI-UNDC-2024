import banner1 from '../../assets/banner1.webp';
import banner2 from '../../assets/banner2.webp';
import banner3 from '../../assets/banner3.webp';
import banner4 from '../../assets/banner4.webp';
import banner5 from '../../assets/banner5.webp';

// El tiempo que tenía el carrusel antes de poder editarse
export const FALLBACK_INTERVAL_SECONDS = 5;

/* Banners que vienen con el sitio: se muestran mientras el panel no tenga diapositivas activas, así la portada nunca queda vacía */
export const fallbackSlides = [banner1, banner2, banner3, banner4, banner5].map((image, index) => ({
  id: `banner-${index + 1}`,
  image,
  imageMobile: null,
  alt: `Banner institucional ${index + 1}`,
  title: '',
  subtitle: '',
  focusX: 50,
  focusY: 50,
  link: null,
}));
