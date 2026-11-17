import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { Field, fieldClass } from '../../editor/editors/fields';
import { createEventSeriesRequest, updateEventSeriesRequest } from '../../../api/events';
import { getApiErrors } from '../../../api/errors';
import { emptySeriesForm, seriesFormToPayload, seriesToForm, slugify, validateSeriesForm } from '../eventForm';
import LogoField from './LogoField';

const API_MESSAGES = {
  'There is already a series with that slug': 'Ya existe un evento con ese identificador.',
  'Image not found': 'El logo ya no está en el servidor. Súbelo de nuevo.',
};

/* Crear o editar una serie de eventos (CIISIC, JEPA…) */
const SeriesFormModal = ({ series, onClose, onSaved }) => {
  const [initial] = useState(() => (series ? seriesToForm(series) : emptySeriesForm()));
  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(series));
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const closeRef = useRef(null);
  const requestCloseRef = useRef(null);

  const set = (changes) => setForm((current) => ({ ...current, ...changes }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const busy = saving || uploading;

  const requestClose = async () => {
    if (busy) return;
    if (dirty) {
      const result = await Swal.fire({ title: '¿Descartar los cambios?', text: 'Lo que editaste en este evento no se guardará.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Descartar', confirmButtonColor: '#dc2626', cancelButtonText: 'Seguir editando', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });
      if (!result.isConfirmed) return;
    }
    onClose();
  };
  requestCloseRef.current = requestClose;

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event) => { if (event.key === 'Escape' && !Swal.isVisible()) requestCloseRef.current(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    const problems = validateSeriesForm(form);
    setErrors(problems);
    if (problems.length) return;

    setSaving(true);
    try {
      const payload = seriesFormToPayload(form);
      const { data } = series ? await updateEventSeriesRequest(series._id, payload) : await createEventSeriesRequest(payload);
      onSaved(data);
    } catch (error) {
      setErrors(getApiErrors(error, 'No se pudo guardar el evento').map((message) => API_MESSAGES[message] ?? message));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="series-editor-title" className="fixed inset-0 z-[10010] flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-4">
      <form onSubmit={handleSave} noValidate className="flex max-h-[100dvh] w-full max-w-3xl flex-col bg-white shadow-3xl sm:max-h-[92vh] sm:rounded-3xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id="series-editor-title" className="text-lg font-bold text-slate-900">{series ? `Editar ${series.sigla}` : 'Nuevo evento'}</h2>
            <p className="mt-0.5 text-sm text-slate-500">Datos que se mantienen en todas las ediciones.</p>
          </div>
          <button ref={closeRef} type="button" onClick={requestClose} aria-label="Cerrar" className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"><X size={20} /></button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <Field label="Sigla *" hint="Así aparece en el menú: «VIII JEPA».">
              <input
                value={form.sigla}
                maxLength={20}
                onChange={(event) => set({ sigla: event.target.value, ...(!slugTouched && { slug: slugify(event.target.value) }) })}
                className={fieldClass}
                required
              />
            </Field>
            <Field label="Nombre completo *">
              <input value={form.nombre} maxLength={200} onChange={(event) => set({ nombre: event.target.value })} className={fieldClass} required />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Identificador *" hint={`Dirección en este portal: /eventos/${form.slug || 'identificador'}`}>
              <input value={form.slug} maxLength={40} onChange={(event) => { setSlugTouched(true); set({ slug: event.target.value.toLowerCase() }); }} className={fieldClass} required />
            </Field>
            <Field label="Dirección permanente *" hint="Siempre muestra la edición vigente. Ej.: https://jepa.episundc.pe/">
              <input type="url" value={form.urlPermanente} maxLength={2048} placeholder="https://" onChange={(event) => set({ urlPermanente: event.target.value })} className={fieldClass} required />
            </Field>
          </div>

          <Field label="Descripción" hint="Una o dos frases. Aparece en la página de eventos.">
            <textarea value={form.descripcion} maxLength={1000} rows={3} onChange={(event) => set({ descripcion: event.target.value })} className={fieldClass} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-600">Logo</p>
              <LogoField url={form.logo} onChange={(logo) => set({ logo, ...(!logo && { logoAlt: '' }) })} onBusyChange={setUploading} />
              {form.logo && (
                <Field label="Descripción del logo">
                  <input value={form.logoAlt} maxLength={200} onChange={(event) => set({ logoAlt: event.target.value })} className={fieldClass} />
                </Field>
              )}
            </div>
            <div className="space-y-4">
              <Field label="Color" hint="Para el monograma y los detalles. Vacío: color institucional.">
                <span className="flex items-center gap-2">
                  <input type="color" value={form.color || '#1081ea'} onChange={(event) => set({ color: event.target.value })} aria-label="Elegir color" className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
                  <input value={form.color} maxLength={7} placeholder="#1081ea" onChange={(event) => set({ color: event.target.value.trim() })} className={fieldClass} />
                </span>
              </Field>
              <Field label="Orden" hint="Los números menores van primero en el menú.">
                <input type="number" min={0} max={999} value={form.orden} onChange={(event) => set({ orden: event.target.value })} className={fieldClass} />
              </Field>
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                <input type="checkbox" checked={form.activo} onChange={(event) => set({ activo: event.target.checked })} className="mt-0.5 h-4 w-4 accent-primary" />
                <span>
                  <span className="block font-semibold">Activo</span>
                  <span className="block text-xs text-slate-500">Si lo desactivas, deja de aparecer en el menú y en la página de eventos.</span>
                </span>
              </label>
            </div>
          </div>

          {errors.length > 0 && (
            <ul role="alert" className="space-y-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.map((message) => <li key={message}>{message}</li>)}
            </ul>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={requestClose} disabled={busy} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">Cancelar</button>
          <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,129,234,0.22)] transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60">
            {saving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} {series ? 'Guardar cambios' : 'Crear evento'}
          </button>
        </footer>
      </form>
    </div>,
    document.body,
  );
};

export default SeriesFormModal;
