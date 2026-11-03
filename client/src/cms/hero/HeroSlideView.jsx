import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const buttonClass = 'mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

// Tipografía y márgenes del texto. 'responsive' sigue el ancho de la pantalla; las otras dos fijan el aspecto de escritorio o de móvil
const textStyles = {
  responsive: {
    wrap: 'px-5 pb-14 pt-24 sm:px-10 sm:pb-16 lg:px-14 lg:pb-20',
    title: 'line-clamp-3 text-2xl sm:line-clamp-none sm:text-4xl lg:text-5xl',
    subtitle: 'line-clamp-2 text-sm sm:line-clamp-3 sm:text-lg',
  },
  desktop: {
    wrap: 'px-14 pb-20 pt-24',
    title: 'text-5xl',
    subtitle: 'line-clamp-3 text-lg',
  },
  mobile: {
    wrap: 'px-5 pb-14 pt-24',
    title: 'line-clamp-3 text-2xl',
    subtitle: 'line-clamp-2 text-sm',
  },
};

const SlideButton = ({ link, preview }) => {
  const content = <>{link.label}<ArrowRight size={16} aria-hidden="true" /></>;
  if (preview) return <span className={buttonClass}>{content}</span>;
  if (link.internal) return <Link to={link.url} className={buttonClass}>{content}</Link>;

  const isWeb = /^https?:/i.test(link.url);
  return <a href={link.url} {...(isWeb && { target: '_blank', rel: 'noopener noreferrer' })} className={buttonClass}>{content}</a>;
};

/* Una diapositiva de la portada: la imagen (con versión para móvil y punto de enfoque) y, si existen, título, subtítulo y botón.
   Las URL de las imágenes ya llegan resueltas. La usan el carrusel público y la vista previa del panel.
   `variant`: 'responsive' elige la imagen y el tamaño del texto según el ancho de la pantalla; 'desktop' y 'mobile' fuerzan uno (vista previa).
   `loadImage` en falso deja el fondo sin descargar la imagen todavía. */
const HeroSlideView = ({ slide, eager = false, loadImage = true, variant = 'responsive', preview = false }) => {
  const hasText = Boolean(slide.title || slide.subtitle || slide.link);
  const mobileImage = slide.imageMobile;
  const text = textStyles[variant];

  const image = loadImage && (
    <img
      src={variant === 'mobile' && mobileImage ? mobileImage : slide.image}
      alt={slide.alt}
      loading={eager ? 'eager' : 'lazy'}
      // React 18 no reconoce `fetchPriority`; el atributo en minúsculas sí llega al DOM
      // eslint-disable-next-line react/no-unknown-property
      fetchpriority={eager ? 'high' : undefined}
      decoding="async"
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
      style={{ objectPosition: `${slide.focusX}% ${slide.focusY}%` }}
    />
  );

  return (
    // fondo oscuro: en mitad del fundido asoma bajo las dos imágenes y un fondo claro las dejaría desvaídas
    <div className="relative h-full w-full overflow-hidden bg-slate-900">
      {image && variant === 'responsive' && mobileImage ? (
        <picture>
          <source media="(max-width: 767px)" srcSet={mobileImage} />
          {image}
        </picture>
      ) : image}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-slate-950/10" />

      {hasText && (
        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent ${text.wrap}`}>
          <div className="max-w-2xl text-white">
            {slide.title && <h2 className={`font-extrabold leading-tight tracking-tight ${text.title}`}>{slide.title}</h2>}
            {slide.subtitle && <p className={`mt-2 leading-relaxed text-slate-100 ${text.subtitle}`}>{slide.subtitle}</p>}
            {slide.link && <SlideButton link={slide.link} preview={preview} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSlideView;
