import { useEffect, useState } from 'react';
import { getHeroRequest } from '../../api/hero';
import { assetUrl } from '../../utils/assetUrl';
import { FALLBACK_INTERVAL_SECONDS, fallbackSlides } from './fallbackSlides';
import { buildHeroState } from './heroSlides';

const fallback = { source: 'fallback', slides: fallbackSlides, intervalSeconds: FALLBACK_INTERVAL_SECONDS };
const loading = { source: 'loading', slides: [], intervalSeconds: FALLBACK_INTERVAL_SECONDS };

// Se conserva la última respuesta mientras dure la sesión: al volver al inicio no hay parpadeo y se actualiza en segundo plano
let lastState = null;

/* Diapositivas de la portada: las del panel o, si no hay ninguna o la API falla, los banners que vienen con el sitio */
export const useHeroSlides = () => {
  const [state, setState] = useState(lastState ?? loading);

  useEffect(() => {
    let cancelled = false;
    getHeroRequest()
      .then(({ data }) => buildHeroState(data, { fallback, resolveUrl: assetUrl }))
      .catch(() => lastState ?? fallback)
      .then((next) => {
        lastState = next;
        if (!cancelled) setState(next);
      });
    return () => { cancelled = true; };
  }, []);

  return state;
};
