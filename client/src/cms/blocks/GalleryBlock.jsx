import { lazy, Suspense, useState } from 'react';
import Lightbox from '../Lightbox';
import { assetUrl } from '../../utils/assetUrl';
import { thumbUrl } from '../media';

// Embla solo se descarga si la noticia tiene una galería en carrusel
const GalleryCarousel = lazy(() => import('./GalleryCarousel'));

/* Si la miniatura no existe (imágenes antiguas) se usa la original */
const useOriginalOnError = (url) => (event) => {
  const image = event.currentTarget;
  if (image.dataset.fallbackUsed) return;
  image.dataset.fallbackUsed = '1';
  image.src = assetUrl(url);
};

const Thumbnail = ({ image, onOpen, buttonClassName, imageClassName }) => {
  const handleError = useOriginalOnError(image.url);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={image.alt || image.caption || 'Ampliar imagen'}
      className={`${buttonClassName} overflow-hidden bg-slate-100 outline-none focus-visible:ring-4 focus-visible:ring-sky-200`}
    >
      <img
        src={assetUrl(thumbUrl(image.url))}
        alt={image.alt || ''}
        loading="lazy"
        decoding="async"
        onError={handleError}
        className={`${imageClassName} transition duration-500 hover:scale-[1.03]`}
      />
    </button>
  );
};

const GalleryGrid = ({ images, onOpen }) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
    {images.map((image, index) => (
      <Thumbnail
        key={`${image.url}-${index}`}
        image={image}
        onOpen={() => onOpen(index)}
        buttonClassName="aspect-square rounded-xl"
        imageClassName="h-full w-full object-cover"
      />
    ))}
  </div>
);

const GalleryMosaic = ({ images, onOpen }) => (
  <div className="columns-2 gap-3 md:columns-3">
    {images.map((image, index) => (
      <Thumbnail
        key={`${image.url}-${index}`}
        image={image}
        onOpen={() => onOpen(index)}
        buttonClassName="mb-3 block w-full break-inside-avoid rounded-xl"
        imageClassName="h-auto w-full"
      />
    ))}
  </div>
);

const GalleryBlock = ({ block }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const images = block.images ?? [];
  if (images.length === 0) return null;

  const open = (index) => setLightboxIndex(index);

  return (
    <div className="mx-auto max-w-5xl">
      {block.layout === 'carousel' && (
        <Suspense fallback={<GalleryGrid images={images} onOpen={open} />}>
          <GalleryCarousel images={images} onOpen={open} />
        </Suspense>
      )}
      {block.layout === 'mosaic' && <GalleryMosaic images={images} onOpen={open} />}
      {block.layout !== 'carousel' && block.layout !== 'mosaic' && <GalleryGrid images={images} onOpen={open} />}

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};

export default GalleryBlock;
