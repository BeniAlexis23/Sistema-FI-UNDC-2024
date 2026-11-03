const STORAGE_KEY = 'fi-stale-chunk-reload';
const MIN_INTERVAL_MS = 30_000;

// Un solo intento cada 30 s por pestaña: si tras recargar el archivo sigue sin existir, se muestra el error en vez de entrar en bucle
export const canReload = (target, now = Date.now()) => {
  try {
    const last = Number(target.sessionStorage.getItem(STORAGE_KEY));
    if (last && now - last < MIN_INTERVAL_MS) return false;
    target.sessionStorage.setItem(STORAGE_KEY, String(now));
    return true;
  } catch {
    // sin sessionStorage no hay cómo evitar el bucle
    return false;
  }
};

// Cada despliegue borra los archivos de la versión anterior: una pestaña abierta antes pide un chunk que ya no existe.
// Vite avisa con `vite:preloadError`; recargar trae el index.html nuevo (se revalida siempre) con los nombres vigentes.
export const reloadOnStaleChunk = (target = window) => {
  target.addEventListener('vite:preloadError', (event) => {
    if (!canReload(target)) return;
    event.preventDefault();
    target.location.reload();
  });
};
