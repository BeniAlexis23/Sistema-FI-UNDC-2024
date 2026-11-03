import { useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Fade from 'embla-carousel-fade';
import { useReducedMotion } from 'framer-motion';
import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';
import { RxDotFilled } from 'react-icons/rx';
import { Pause, Play } from 'lucide-react';
import HeroSlideView from './HeroSlideView';

export const HERO_HEIGHT = 'h-[300px] sm:h-[360px] md:h-[420px] lg:h-[500px] xl:h-[560px] 2xl:h-[620px]';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';
const arrowClass = `absolute top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/35 p-3 text-white transition hover:bg-black/55 lg:flex ${focusRing}`;

/* Carrusel de la portada: se desliza con el dedo, avanza solo y se detiene al pasar el cursor, al enfocar el botón de una
   diapositiva, al pausarlo o con la pestaña oculta. Con «reducir movimiento» en el sistema empieza en pausa.
   Las imágenes se descargan a medida que se acercan (la actual y la siguiente). */
const HeroCarousel = ({ slides, intervalSeconds }) => {
  const count = slides.length;
  const multiple = count > 1;
  const reducedMotion = useReducedMotion();
  const plugins = useMemo(() => [Fade()], []);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: multiple, watchDrag: multiple, duration: 30 }, plugins);

  const [selected, setSelected] = useState(0);
  const [loaded, setLoaded] = useState(() => new Set([0, 1 % count]));
  const [paused, setPaused] = useState(Boolean(reducedMotion));
  const [hovering, setHovering] = useState(false);
  const [focusedInside, setFocusedInside] = useState(false);
  const [tabHidden, setTabHidden] = useState(() => document.hidden);

  const playing = multiple && !paused && !hovering && !focusedInside && !tabHidden;

  useEffect(() => {
    if (!emblaApi) return undefined;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect).on('reInit', onSelect);
    return () => { emblaApi.off('select', onSelect).off('reInit', onSelect); };
  }, [emblaApi]);

  useEffect(() => {
    setLoaded((current) => {
      if (current.has(selected) && current.has((selected + 1) % count)) return current;
      return new Set([...current, selected, (selected + 1) % count]);
    });
  }, [selected, count]);

  useEffect(() => {
    const onVisibilityChange = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  // cada cambio de diapositiva (manual o automático) reinicia la cuenta para que todas duren lo mismo
  useEffect(() => {
    if (!emblaApi || !playing) return undefined;
    const timer = setTimeout(() => emblaApi.scrollNext(), intervalSeconds * 1000);
    return () => clearTimeout(timer);
  }, [emblaApi, playing, intervalSeconds, selected]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Portada institucional"
      className="relative overflow-hidden rounded-[1.75rem] bg-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
    >
      <div
        ref={emblaRef}
        className="overflow-hidden"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setFocusedInside(true)}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusedInside(false); }}
      >
        <div className={`flex ${HERO_HEIGHT}`} aria-live={playing ? 'off' : 'polite'}>
          {slides.map((slide, index) => (
            <div key={slide.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${count}`} className="min-w-0 flex-[0_0_100%]">
              <HeroSlideView slide={slide} eager={index === 0} loadImage={loaded.has(index)} />
            </div>
          ))}
        </div>
      </div>

      {multiple && (
        <>
          <button type="button" onClick={() => emblaApi?.scrollPrev()} aria-label="Diapositiva anterior" className={`${arrowClass} left-3`}>
            <BsChevronCompactLeft size={26} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => emblaApi?.scrollNext()} aria-label="Diapositiva siguiente" className={`${arrowClass} right-3`}>
            <BsChevronCompactRight size={26} aria-hidden="true" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm sm:bottom-5">
            <button
              type="button"
              onClick={() => setPaused((current) => !current)}
              aria-label={paused ? 'Reanudar el carrusel' : 'Pausar el carrusel'}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-white transition hover:bg-white/15 ${focusRing}`}
            >
              {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            </button>
            <span className="mx-1 h-4 w-px bg-white/30" aria-hidden="true" />
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Ir a la diapositiva ${index + 1}`}
                aria-current={index === selected ? 'true' : undefined}
                className={`rounded-full text-xl transition sm:text-2xl ${focusRing} ${index === selected ? 'text-white' : 'text-white/45 hover:text-white/80'}`}
              >
                <RxDotFilled aria-hidden="true" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroCarousel;
