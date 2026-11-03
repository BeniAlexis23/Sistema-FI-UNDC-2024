import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { assetUrl } from '../utils/assetUrl';

const SWIPE_DISTANCE = 50;
const FOCUSABLE = 'button, [href], [tabindex]:not([tabindex="-1"])';

/* Visor de imágenes a pantalla completa. El z-index supera el del navbar (App.css fuerza nav a 10001). */
const Lightbox = ({ images, index, onClose, onIndexChange }) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const touchStart = useRef(null);
  const total = images.length;
  const image = images[index];

  const go = useCallback(
    (step) => onIndexChange((index + step + total) % total),
    [index, total, onIndexChange],
  );

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && total > 1) {
        go(-1);
      } else if (event.key === 'ArrowRight' && total > 1) {
        go(1);
      } else if (event.key === 'Tab') {
        // el foco no sale del visor mientras está abierto
        const focusable = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [go, onClose, total]);

  const handleTouchEnd = (event) => {
    if (touchStart.current === null || total < 2) return;
    const distance = event.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(distance) >= SWIPE_DISTANCE) go(distance > 0 ? -1 : 1);
  };

  const stop = (event) => event.stopPropagation();

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de imágenes"
      className="fixed inset-0 z-[10010] flex flex-col bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-semibold" aria-live="polite">{index + 1} / {total}</span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar visor"
          className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
        >
          <X size={22} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
        <img
          src={assetUrl(image.url)}
          alt={image.alt || image.caption || ''}
          onClick={stop}
          className="max-h-full max-w-full select-none object-contain"
        />
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => { stop(event); go(-1); }}
              aria-label="Imagen anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25 sm:left-4"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              type="button"
              onClick={(event) => { stop(event); go(1); }}
              aria-label="Imagen siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25 sm:right-4"
            >
              <ChevronRight size={26} />
            </button>
          </>
        )}
      </div>

      <p className="min-h-[3.5rem] px-6 py-4 text-center text-sm text-white/90" onClick={stop}>
        {image.caption}
      </p>
    </div>,
    document.body,
  );
};

export default Lightbox;
