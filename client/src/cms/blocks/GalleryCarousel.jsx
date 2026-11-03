import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { assetUrl } from '../../utils/assetUrl';

/* Carrusel con arrastre táctil y flechas; sin avance automático (accesibilidad) */
const GalleryCarousel = ({ images, onOpen }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [selected, setSelected] = useState(0);

  const updateSelected = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return undefined;
    updateSelected();
    emblaApi.on('select', updateSelected);
    emblaApi.on('reInit', updateSelected);
    return () => {
      emblaApi.off('select', updateSelected);
      emblaApi.off('reInit', updateSelected);
    };
  }, [emblaApi, updateSelected]);

  const many = images.length > 1;

  return (
    <div className="relative" role="group" aria-roledescription="carrusel" aria-label="Galería de imágenes">
      <div className="overflow-hidden rounded-2xl bg-slate-100" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="relative min-w-0 shrink-0 grow-0 basis-full"
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${index + 1} de ${images.length}`}
            >
              <button
                type="button"
                onClick={() => onOpen(index)}
                aria-label={image.alt || image.caption || 'Ampliar imagen'}
                className="block w-full outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-200"
              >
                <img
                  src={assetUrl(image.url)}
                  alt={image.alt || ''}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="aspect-[16/9] w-full object-cover"
                />
              </button>
              {image.caption && (
                <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10 text-sm text-white">
                  {image.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {many && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white transition hover:bg-black/60"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Imagen siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white transition hover:bg-black/60"
          >
            <ChevronRight size={22} />
          </button>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {images.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Ir a la imagen ${index + 1}`}
                aria-current={selected === index ? 'true' : undefined}
                className={`h-2.5 rounded-full transition-all ${selected === index ? 'w-7 bg-primary' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GalleryCarousel;
