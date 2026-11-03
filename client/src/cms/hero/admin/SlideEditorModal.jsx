import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ImageOff, Monitor, Smartphone, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { createHeroSlideRequest, updateHeroSlideRequest } from '../../../api/hero';
import { getNoticiasRequest } from '../../../api/notices';
import { getApiErrors } from '../../../api/errors';
import { assetUrl } from '../../../utils/assetUrl';
import ImageDropzone from '../../editor/ImageDropzone';
import { ErrorText, Field, OptionGroup, ProgressBar, TextInput, fieldClass } from '../../editor/editors/fields';
import { uploadErrorMessage, uploadImage, validateImageFile } from '../../editor/uploads';
import { thumbUrl } from '../../media';
import HeroSlideView from '../HeroSlideView';
import { DEFAULT_LINK_LABELS, LIMITS, emptyForm, formFromSlide, imageNotes, previewLink, toPayload, validateForm } from '../heroForm';
import FocusPicker from './FocusPicker';
import ScaledPreview from './ScaledPreview';
import { useImageSize } from './useImageSize';

const NOTICE_LIMIT = 50;
const sectionTitle = 'text-sm font-bold text-slate-900';
const sectionHint = 'mt-1 text-xs text-slate-500';

const previewModes = [
  { value: 'desktop', label: 'Escritorio', icon: <Monitor size={16} aria-hidden="true" /> },
  { value: 'mobile', label: 'Móvil', icon: <Smartphone size={16} aria-hidden="true" /> },
];

const linkTypes = [
  { value: 'none', label: 'Sin botón' },
  { value: 'notice', label: 'Una noticia' },
  { value: 'url', label: 'Un enlace' },
];

const ImageSection = ({ id, title, hint, url, kind, required = false, upload, error, busy, onPick, onRemove }) => {
  const size = useImageSize(url);

  return (
    <section aria-labelledby={id}>
      <h3 id={id} className={sectionTitle}>{title}{required && <span className="text-red-500" aria-hidden="true"> *</span>}</h3>
      <p className={sectionHint}>{hint}</p>
      <div className="mt-3 flex gap-3">
        {url && <img src={assetUrl(thumbUrl(url))} alt="" className="h-20 w-32 shrink-0 rounded-xl border border-slate-200 object-cover" />}
        <div className="min-w-0 flex-1">
          <ImageDropzone compact title={url ? 'Cambiar la imagen' : undefined} onFiles={onPick} disabled={busy} />
        </div>
      </div>
      {upload && <div className="mt-2"><ProgressBar percent={upload.percent} /></div>}
      {error && <div className="mt-2"><ErrorText>{error}</ErrorText></div>}
      {size && <p className="mt-2 text-xs text-slate-500">{size.width} × {size.height} px</p>}
      {imageNotes(size, kind).map((note) => (
        <p key={note} className="mt-2 flex items-start gap-2 text-sm text-amber-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{note}
        </p>
      ))}
      {onRemove && url && (
        <button type="button" onClick={onRemove} disabled={busy} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 transition hover:underline disabled:opacity-50">
          <Trash2 size={14} aria-hidden="true" /> Quitar esta imagen
        </button>
      )}
    </section>
  );
};

/* Crear o editar una diapositiva de la portada. `slide` es la diapositiva a editar (null para una nueva);
   `onSaved` recibe la diapositiva guardada tal como la devuelve el servidor. */
const SlideEditorModal = ({ slide, onClose, onSaved }) => {
  const initial = useMemo(() => (slide ? formFromSlide(slide) : emptyForm()), [slide]);
  const [form, setForm] = useState(initial);
  const [notices, setNotices] = useState([]);
  const [noticesFailed, setNoticesFailed] = useState(false);
  const [upload, setUpload] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [problems, setProblems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const closeRef = useRef(null);
  const requestCloseRef = useRef(null);

  const set = (changes) => setForm((current) => ({ ...current, ...changes }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const busy = saving || Boolean(upload);

  const requestClose = async () => {
    if (busy) return;
    if (dirty) {
      const result = await Swal.fire({ title: '¿Descartar los cambios?', text: 'Lo que editaste en esta diapositiva no se guardará.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Descartar', confirmButtonColor: '#dc2626', cancelButtonText: 'Seguir editando', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });
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

  // el listado público trae las noticias de todos (el del panel solo le muestra al editor las suyas) y son justo las que el sitio puede enlazar
  useEffect(() => {
    getNoticiasRequest({ limit: NOTICE_LIMIT, sort: 'date_desc' })
      .then(({ data }) => setNotices(Array.isArray(data) ? data : []))
      .catch(() => setNoticesFailed(true));
  }, []);

  // la noticia que ya enlaza la diapositiva debe poder verse aunque ya no esté entre las más recientes
  const noticeOptions = useMemo(() => {
    const options = notices.map(({ _id, title }) => ({ _id, title }));
    if (slide?.notice && !options.some((option) => option._id === slide.notice._id)) {
      options.unshift({ _id: slide.notice._id, title: slide.notice.title ?? 'Noticia sin título' });
    }
    return options;
  }, [notices, slide]);

  const pickImage = async (field, [file]) => {
    const invalid = validateImageFile(file);
    if (invalid) {
      setUploadError({ field, message: invalid });
      return;
    }
    setUploadError(null);
    setUpload({ field, percent: 0 });
    try {
      const uploaded = await uploadImage(file, (percent) => setUpload({ field, percent }));
      set({ [field]: uploaded.url });
    } catch (error) {
      setUploadError({ field, message: uploadErrorMessage(error) });
    } finally {
      setUpload(null);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const found = validateForm(form);
    setProblems(found);
    if (found.length > 0) return;

    setSaving(true);
    try {
      const payload = toPayload(form);
      const { data } = slide ? await updateHeroSlideRequest(slide._id, payload) : await createHeroSlideRequest(payload);
      onSaved(data);
    } catch (error) {
      setProblems(getApiErrors(error, 'No se pudo guardar la diapositiva'));
      setSaving(false);
    }
  };

  const previewSlide = useMemo(() => ({
    id: 'preview',
    image: assetUrl(form.image),
    imageMobile: form.imageMobile ? assetUrl(form.imageMobile) : null,
    alt: form.alt,
    title: form.title.trim(),
    subtitle: form.subtitle.trim(),
    focusX: form.focusX,
    focusY: form.focusY,
    link: previewLink(form),
  }), [form]);

  const errorFor = (field) => (uploadError?.field === field ? uploadError.message : '');

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="slide-editor-title" className="fixed inset-0 z-[10010] flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-4">
      <form onSubmit={handleSave} noValidate className="flex max-h-[100dvh] w-full max-w-5xl flex-col bg-white shadow-3xl sm:max-h-[92vh] sm:rounded-3xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id="slide-editor-title" className="text-lg font-bold text-slate-900">{slide ? 'Editar diapositiva' : 'Nueva diapositiva'}</h2>
            <p className="mt-0.5 text-sm text-slate-500">Imagen, texto opcional y cuándo se muestra.</p>
          </div>
          <button ref={closeRef} type="button" onClick={requestClose} aria-label="Cerrar" className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"><X size={20} /></button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 overflow-y-auto px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-8">
            <ImageSection
              id="slide-image-title"
              title="Imagen principal"
              required
              kind="desktop"
              hint="Horizontal y de al menos 1920 px de ancho. JPG, PNG o WebP."
              url={form.image}
              upload={upload?.field === 'image' ? upload : null}
              error={errorFor('image')}
              busy={busy}
              onPick={(files) => pickImage('image', files)}
            />

            <ImageSection
              id="slide-mobile-title"
              title="Imagen para móvil (opcional)"
              kind="mobile"
              hint="Se usa en pantallas de menos de 768 px. Si no la subes, se usa la principal recortada según la zona que conserves."
              url={form.imageMobile}
              upload={upload?.field === 'imageMobile' ? upload : null}
              error={errorFor('imageMobile')}
              busy={busy}
              onPick={(files) => pickImage('imageMobile', files)}
              onRemove={() => set({ imageMobile: '' })}
            />

            <section aria-labelledby="slide-focus-title">
              <h3 id="slide-focus-title" className={sectionTitle}>Zona que se conserva</h3>
              <p className={sectionHint}>Cuando la imagen se recorta para encajar en la pantalla, se mantiene visible esta zona.</p>
              <div className="mt-3"><FocusPicker x={form.focusX} y={form.focusY} onChange={set} /></div>
            </section>

            <section aria-labelledby="slide-text-title" className="space-y-4">
              <div>
                <h3 id="slide-text-title" className={sectionTitle}>Texto</h3>
                <p className={sectionHint}>El título y el subtítulo son opcionales: muchas imágenes ya traen su propio texto.</p>
              </div>
              <TextInput label="Descripción de la imagen" hint="La leen los lectores de pantalla y se ve si la imagen no carga. Descríbela en pocas palabras." value={form.alt} maxLength={LIMITS.alt} onChange={(alt) => set({ alt })} />
              <TextInput label="Título" hint={`${form.title.length}/${LIMITS.title}`} value={form.title} maxLength={LIMITS.title} onChange={(title) => set({ title })} />
              <Field label="Subtítulo" hint={`${form.subtitle.length}/${LIMITS.subtitle}`}>
                <textarea rows={2} value={form.subtitle} maxLength={LIMITS.subtitle} onChange={(event) => set({ subtitle: event.target.value })} className={fieldClass} />
              </Field>
            </section>

            <section aria-labelledby="slide-link-title" className="space-y-4">
              <div>
                <h3 id="slide-link-title" className={sectionTitle}>Botón</h3>
                <p className={sectionHint}>Un botón sobre la imagen que lleva a una noticia del portal o a otra dirección.</p>
              </div>
              <OptionGroup label="Destino del botón" value={form.linkType} options={linkTypes} onChange={(linkType) => set({ linkType })} />
              {form.linkType === 'notice' && (
                <Field label="Noticia" hint={noticesFailed ? 'No se pudo cargar la lista de noticias.' : `Se listan las ${NOTICE_LIMIT} publicadas más recientes. El botón solo aparece mientras la noticia esté publicada.`}>
                  <select value={form.notice} onChange={(event) => set({ notice: event.target.value })} className={fieldClass}>
                    <option value="">Elige una noticia…</option>
                    {noticeOptions.map((option) => <option key={option._id} value={option._id}>{option.title}</option>)}
                  </select>
                </Field>
              )}
              {form.linkType === 'url' && (
                <TextInput label="Dirección" type="url" placeholder="https://…" value={form.ctaUrl} maxLength={LIMITS.ctaUrl} onChange={(ctaUrl) => set({ ctaUrl })} />
              )}
              {form.linkType !== 'none' && (
                <TextInput label="Texto del botón" hint={`Si lo dejas vacío dice «${DEFAULT_LINK_LABELS[form.linkType]}». ${form.ctaLabel.length}/${LIMITS.ctaLabel}`} value={form.ctaLabel} maxLength={LIMITS.ctaLabel} onChange={(ctaLabel) => set({ ctaLabel })} />
              )}
            </section>

            <section aria-labelledby="slide-publish-title" className="space-y-4">
              <h3 id="slide-publish-title" className={sectionTitle}>Publicación</h3>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={form.active} onChange={(event) => set({ active: event.target.checked })} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-sky-200" />
                <span>
                  <span className="font-semibold text-slate-800">Mostrar esta diapositiva</span>
                  <span className="block text-slate-500">Apágala para guardarla sin que se vea en el sitio.</span>
                </span>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mostrar desde" hint="Hora de Lima">
                  <input type="datetime-local" value={form.startAt} onChange={(event) => set({ startAt: event.target.value })} className={fieldClass} />
                </Field>
                <Field label="Mostrar hasta" hint="Hora de Lima">
                  <input type="datetime-local" value={form.endAt} onChange={(event) => set({ endAt: event.target.value })} className={fieldClass} />
                </Field>
              </div>
              <p className={sectionHint}>Déjalas vacías para que se muestre siempre que esté activa.</p>
            </section>
          </div>

          <aside aria-label="Vista previa" className="order-first space-y-3 lg:order-none lg:sticky lg:top-0 lg:self-start">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className={sectionTitle}>Vista previa</h3>
              <OptionGroup label="Tamaño de la vista previa" value={previewMode} options={previewModes} onChange={setPreviewMode} />
            </div>
            {!form.image ? (
              <div className="flex aspect-[2.2/1] items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-500">
                <ImageOff size={18} aria-hidden="true" /> Sube una imagen para ver la vista previa
              </div>
            ) : previewMode === 'desktop' ? (
              <ScaledPreview width={1200} height={520}><HeroSlideView slide={previewSlide} variant="desktop" preview eager /></ScaledPreview>
            ) : (
              <ScaledPreview width={375} height={300} maxWidth={240}><HeroSlideView slide={previewSlide} variant="mobile" preview eager /></ScaledPreview>
            )}
            <p className="text-xs text-slate-500">Así se verá en el sitio. El borde de la imagen se recorta según el tamaño de la pantalla.</p>
          </aside>
        </div>

        <footer className="border-t border-slate-200 px-5 py-4 sm:px-6">
          {problems.length > 0 && (
            <ul role="alert" className="mb-3 space-y-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {problems.map((problem) => <li key={problem}>{problem}</li>)}
            </ul>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={requestClose} disabled={busy} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={busy} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,129,234,0.22)] transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Guardando…' : slide ? 'Guardar cambios' : 'Crear diapositiva'}
            </button>
          </div>
        </footer>
      </form>
    </div>,
    document.body,
  );
};

export default SlideEditorModal;
