import { useEffect, useState } from 'react';
import { assetUrl } from '../../../utils/assetUrl';

/* Mide una imagen ya subida ({ width, height }); es null mientras no se conoce */
export const useImageSize = (url) => {
  const [size, setSize] = useState(null);

  useEffect(() => {
    if (!url) {
      setSize(null);
      return undefined;
    }
    let cancelled = false;
    const image = new Image();
    image.onload = () => { if (!cancelled) setSize({ width: image.naturalWidth, height: image.naturalHeight }); };
    image.onerror = () => { if (!cancelled) setSize(null); };
    image.src = assetUrl(url);
    return () => { cancelled = true; };
  }, [url]);

  return size;
};
