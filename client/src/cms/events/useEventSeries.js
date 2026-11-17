import { useEffect, useState } from 'react';
import { getEventosRequest } from '../../api/events';
import { FALLBACK_SERIES, FALLBACK_STATE, buildEventsState, toMenuItems } from './eventMenu';

const loading = { source: 'loading', series: FALLBACK_SERIES };

// Se conserva la última respuesta mientras dure la sesión: el menú no parpadea al cambiar de página y se actualiza en segundo plano.
// El menú, el pie y la portada se montan a la vez: comparten un solo pedido.
let lastState = null;
let pending = null;

const refresh = () => {
  if (!pending) {
    pending = getEventosRequest()
      .then(({ data }) => buildEventsState(data))
      .catch(() => lastState ?? FALLBACK_STATE)
      .then((next) => {
        lastState = next;
        pending = null;
        return next;
      });
  }
  return pending;
};

/* Series de eventos activas con su edición vigente. Si la API falla o no hay ninguna, la lista incluida en el sitio */
export const useEventSeries = () => {
  const [state, setState] = useState(lastState ?? loading);

  useEffect(() => {
    let cancelled = false;
    refresh().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => { cancelled = true; };
  }, []);

  return { ...state, menuItems: toMenuItems(state.series) };
};

/* Para el panel: tras editar el catálogo, la próxima visita al sitio vuelve a pedirlo */
export const invalidateEventSeries = () => {
  lastState = null;
};
