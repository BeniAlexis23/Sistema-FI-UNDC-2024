import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, Mail, Share2, X } from 'lucide-react';
import { FaFacebookF, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';

/* Enlace que se comparte: lo atiende el backend (/compartir) con las metaetiquetas de la noticia
   y redirige al portal, porque con HashRouter WhatsApp y Facebook nunca verían el título ni la imagen */
export const shareUrlFor = (id) => `${window.location.origin}/compartir/noticias/${id}`;

const optionClass = 'flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:bg-sky-50 hover:text-primary';

const ShareDialog = ({ notice, url, onClose }) => {
  const closeRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const title = encodeURIComponent(notice.title);
  const link = encodeURIComponent(url);

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sin permiso para el portapapeles: el enlace queda seleccionado para copiarlo a mano
      document.getElementById('share-link')?.select();
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
      className="fixed inset-0 z-[10010] flex items-end justify-center bg-slate-950/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-3xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="share-title" className="text-lg font-bold text-slate-900">Compartir noticia</h2>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{notice.title}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <a className={optionClass} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${title}%20${link}`}>
            <FaWhatsapp className="text-lg text-emerald-500" /> WhatsApp
          </a>
          <a className={optionClass} target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${link}`}>
            <FaFacebookF className="text-lg text-blue-600" /> Facebook
          </a>
          <a className={optionClass} target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?text=${title}&url=${link}`}>
            <FaXTwitter className="text-lg text-slate-900" /> X
          </a>
          <a className={optionClass} href={`mailto:?subject=${title}&body=${title}%0A${link}`}>
            <Mail size={18} className="text-slate-500" /> Correo
          </a>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            id="share-link"
            readOnly
            value={url}
            onFocus={(event) => event.target.select()}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-sky-300"
          />
          <button
            type="button"
            onClick={copy}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <p className="sr-only" role="status">{copied ? 'Enlace copiado' : ''}</p>
      </div>
    </div>,
    document.body,
  );
};

const prefersNativeShare = () => (
  typeof navigator.share === 'function' && window.matchMedia?.('(pointer: coarse)').matches
);

/* En el celular abre el menú nativo de compartir; en el computador, un cuadro con las opciones */
const ShareButton = ({ notice, className = '', label = 'Compartir' }) => {
  const [open, setOpen] = useState(false);

  const handleClick = async () => {
    if (!prefersNativeShare()) {
      setOpen(true);
      return;
    }
    try {
      await navigator.share({ title: notice.title, text: notice.description, url: shareUrlFor(notice._id) });
    } catch (error) {
      if (error.name !== 'AbortError') setOpen(true);
    }
  };

  return (
    <>
      <button type="button" onClick={handleClick} aria-haspopup="dialog" className={className}>
        <Share2 className="mr-1 h-4 w-4" aria-hidden="true" />
        <span className="text-sm">{label}</span>
      </button>
      {open && <ShareDialog notice={notice} url={shareUrlFor(notice._id)} onClose={() => setOpen(false)} />}
    </>
  );
};

export default ShareButton;
