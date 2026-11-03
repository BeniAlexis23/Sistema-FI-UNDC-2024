import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, Loader2, Pencil, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminLayout from '../components/AdminLayout';
import CategoryField from '../cms/editor/CategoryField';
import CoverField from '../cms/editor/CoverField';
import NoticePreview from '../cms/editor/NoticePreview';
import { Field, fieldClass } from '../cms/editor/editors/fields';
import { SUMMARY_MAX, emptyForm, formFromNotice, toApiPayload, validateForm } from '../cms/editor/noticeForm';
import { createNoticeJsonRequest, updateNoticeJsonRequest } from '../api/notices';
import { getCategoriesRequest } from '../api/categories';
import { getApiErrors } from '../api/errors';
import { useNotices } from '../context/NoticesContext';
import { fromLimaInput, toLimaInput } from '../utils/noticeDate';

// TipTap, el reordenamiento y la subida de fotos solo se descargan al abrir el editor
const BlockEditor = lazy(() => import('../cms/editor/BlockEditor'));

const cardClass = 'rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-7';

const modes = [
  { value: 'published', label: 'Publicar ahora', hint: 'Se ve en el portal apenas la guardes.' },
  { value: 'scheduled', label: 'Programar', hint: 'Se publica sola en la fecha y hora que elijas.' },
  { value: 'hidden', label: 'Ocultar', hint: 'Queda guardada pero no se ve en el portal.' },
];

const tomorrowAtNine = () => `${toLimaInput(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()).slice(0, 10)}T09:00`;

const Section = ({ title, description, children }) => (
  <section className={cardClass}>
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    <div className="mt-5 space-y-5">{children}</div>
  </section>
);

const NoticesFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { getNotice } = useNotices();
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(() => JSON.stringify(emptyForm()));
  const [loadState, setLoadState] = useState(isEdit ? 'loading' : 'ready');
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [blocksBusy, setBlocksBusy] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [view, setView] = useState('edit');

  const dirty = useMemo(() => JSON.stringify(form) !== saved, [form, saved]);
  const busy = blocksBusy || coverBusy;
  const set = useCallback((changes) => setForm((current) => ({ ...current, ...changes })), []);
  const setBlocks = useCallback((updater) => setForm((current) => ({
    ...current,
    blocks: typeof updater === 'function' ? updater(current.blocks) : updater,
  })), []);

  const loadNotice = useCallback(async () => {
    setLoadState('loading');
    try {
      const next = formFromNotice(await getNotice(id));
      setForm(next);
      setSaved(JSON.stringify(next));
      setLoadState('ready');
    } catch (error) {
      setLoadState(error.response?.status === 404 ? 'notFound' : 'error');
    }
  }, [getNotice, id]);

  useEffect(() => { if (isEdit) loadNotice(); }, [isEdit, loadNotice]);

  useEffect(() => {
    getCategoriesRequest().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  // avisa si se intenta cerrar o recargar la pestaña con cambios sin guardar
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const chooseMode = (mode) => set({
    mode,
    ...(mode === 'scheduled' && !form.publishAtLocal && { publishAtLocal: tomorrowAtNine() }),
  });

  const handleCancel = async (event) => {
    event.preventDefault();
    if (dirty) {
      const result = await Swal.fire({ title: '¿Salir sin guardar?', text: 'Se perderán los cambios de esta noticia.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Salir', confirmButtonColor: '#dc2626', cancelButtonText: 'Seguir editando', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });
      if (!result.isConfirmed) return;
    }
    navigate('/notices');
  };

  const handleConflict = async () => {
    const result = await Swal.fire({
      title: 'Esta noticia cambió',
      text: 'Otra persona la modificó mientras la editabas. Puedes cargar la versión guardada (perderás tus cambios) o seguir editando.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cargar la versión guardada',
      confirmButtonColor: '#1081ea',
      cancelButtonText: 'Seguir editando',
      cancelButtonColor: '#475569',
      reverseButtons: true,
    });
    if (result.isConfirmed) loadNotice();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const problems = validateForm(form);
    setErrors(problems);
    if (problems.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const verb = { published: 'Publicar', scheduled: 'Programar', hidden: 'Guardar como oculta' }[form.mode];
    const confirmation = await Swal.fire({
      title: isEdit ? '¿Guardar los cambios?' : `¿${verb} la noticia?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Guardar' : verb,
      confirmButtonColor: '#1081ea',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#475569',
      reverseButtons: true,
      focusCancel: true,
    });
    if (!confirmation.isConfirmed) return;

    setSaving(true);
    try {
      const payload = toApiPayload(form, { isEdit });
      await (isEdit ? updateNoticeJsonRequest(id, payload) : createNoticeJsonRequest(payload));
      setSaved(JSON.stringify(form));
      await Swal.fire({ title: isEdit ? 'Cambios guardados' : 'Noticia guardada', icon: 'success', confirmButtonColor: '#1081ea' });
      navigate('/notices');
    } catch (error) {
      if (error.response?.data?.code === 'NOTICE_CONFLICT') {
        await handleConflict();
      } else {
        setErrors(getApiErrors(error, 'No se pudo guardar la noticia'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setSaving(false);
    }
  };

  const title = isEdit ? 'Editar noticia' : 'Nueva noticia';
  const description = 'Completa la información que se mostrará en el portal institucional.';

  if (loadState !== 'ready') {
    return (
      <AdminLayout title={title} description={description}>
        <div className={`${cardClass} mx-auto max-w-4xl text-center`}>
          {loadState === 'loading' && <p role="status" className="inline-flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={18} /> Cargando noticia…</p>}
          {loadState === 'notFound' && <><p className="font-semibold text-slate-800">No encontramos esta noticia.</p><p className="mt-1 text-sm text-slate-500">Puede haber sido eliminada o pertenecer a otra persona.</p></>}
          {loadState === 'error' && <><p className="font-semibold text-slate-800">No pudimos cargar la noticia.</p><button type="button" onClick={loadNotice} className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary">Reintentar</button></>}
          {loadState !== 'loading' && <Link to="/notices" className="mt-4 inline-block text-sm font-semibold text-primary hover:text-secondary">Volver a las noticias</Link>}
        </div>
      </AdminLayout>
    );
  }

  const categoryName = categories.find((category) => category._id === form.categoryId)?.name ?? '';
  const scheduledInPast = form.mode === 'scheduled' && form.publishAtLocal && new Date(fromLimaInput(form.publishAtLocal)) <= new Date();
  const summaryLength = Array.from(form.summary).length;

  return (
    <AdminLayout title={title} description={description}>
      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-4xl space-y-6">
        {errors.length > 0 && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Revisa lo siguiente:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">{errors.map((error) => <li key={error}>{error}</li>)}</ul>
          </div>
        )}

        <Section title="Datos principales">
          <Field label="Título">
            <input type="text" value={form.title} maxLength={200} autoFocus={!isEdit} placeholder="Título de la publicación" onChange={(event) => set({ title: event.target.value })} className={fieldClass} />
          </Field>
          <Field label="Resumen" hint="Aparece en las tarjetas y al compartir. Si lo dejas vacío se toma del primer párrafo.">
            <textarea rows="3" value={form.summary} placeholder="Una o dos frases que inviten a leer la noticia" onChange={(event) => set({ summary: event.target.value })} className={`${fieldClass} resize-y`} />
            <span className={`mt-1 block text-right text-xs ${summaryLength > SUMMARY_MAX ? 'font-semibold text-red-600' : 'text-slate-400'}`}>{summaryLength} / {SUMMARY_MAX}</span>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <CategoryField categories={categories} value={form.categoryId} onSelect={(categoryId) => set({ categoryId })} onCategoriesChange={setCategories} />
            <Field label="Autor o fuente (opcional)" hint="Se muestra en la noticia, por ejemplo: Escuela de Ingeniería de Sistemas.">
              <input type="text" value={form.byline} maxLength={80} onChange={(event) => set({ byline: event.target.value })} className={fieldClass} />
            </Field>
          </div>
        </Section>

        <Section title="Portada" description="La imagen principal de la noticia. Es opcional.">
          <CoverField
            url={form.coverUrl}
            alt={form.imageAlt}
            onUrlChange={(url) => set({ coverUrl: url, coverChanged: true })}
            onAltChange={(imageAlt) => set({ imageAlt })}
            onBusyChange={setCoverBusy}
          />
        </Section>

        <Section title="Publicación">
          <div role="radiogroup" aria-label="Estado de la noticia" className="grid gap-3 sm:grid-cols-3">
            {modes.map(({ value, label, hint }) => (
              <button key={value} type="button" role="radio" aria-checked={form.mode === value} onClick={() => chooseMode(value)} className={`rounded-2xl border p-4 text-left transition ${form.mode === value ? 'border-primary bg-sky-50 ring-4 ring-sky-100' : 'border-slate-200 hover:border-sky-200'}`}>
                <span className="block text-sm font-bold text-slate-900">{label}</span>
                <span className="mt-1 block text-xs text-slate-500">{hint}</span>
              </button>
            ))}
          </div>

          {form.mode === 'scheduled' ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Fecha y hora de publicación" hint="Hora de Lima (UTC-5).">
                <input type="datetime-local" value={form.publishAtLocal} onChange={(event) => set({ publishAtLocal: event.target.value })} className={fieldClass} />
              </Field>
              {scheduledInPast && <p className="self-end rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Esa fecha ya pasó: la noticia se publicará de inmediato.</p>}
            </div>
          ) : (
            <div className="max-w-xs">
              <Field label="Fecha que se muestra en la noticia">
                <input type="date" value={form.displayDate} onChange={(event) => set({ displayDate: event.target.value })} className={fieldClass} />
              </Field>
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-amber-300">
            <input type="checkbox" checked={form.featured} onChange={(event) => set({ featured: event.target.checked })} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-sky-200" />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900"><Star size={15} className="text-amber-500" fill="currentColor" /> Destacada</span>
              <span className="mt-0.5 block text-xs text-slate-500">Aparece primero en Actualidad (hasta tres noticias destacadas a la vez).</span>
            </span>
          </label>
        </Section>

        <section className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Contenido</h2>
              <p className="mt-1 text-sm text-slate-500">Combina texto, fotos, galerías y videos en el orden que quieras.</p>
            </div>
            <div role="tablist" aria-label="Modo del contenido" className="inline-flex rounded-xl bg-slate-100 p-1">
              {[{ key: 'edit', label: 'Editar', icon: Pencil }, { key: 'preview', label: 'Vista previa', icon: Eye }].map(({ key, label, icon: Icon }) => (
                <button key={key} type="button" role="tab" aria-selected={view === key} onClick={() => setView(key)} className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${view === key ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-primary'}`}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            {view === 'edit' ? (
              <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />}>
                <BlockEditor blocks={form.blocks} onBlocksChange={setBlocks} onBusyChange={setBlocksBusy} />
              </Suspense>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-2 sm:p-4"><NoticePreview form={form} categoryName={categoryName} /></div>
            )}
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-end">
          {busy && <p role="status" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 sm:mr-auto"><Loader2 className="animate-spin" size={16} /> Subiendo imágenes…</p>}
          <button type="button" onClick={handleCancel} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancelar</button>
          <button type="submit" disabled={saving || busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,129,234,0.2)] transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60">
            {saving && <Loader2 className="animate-spin" size={16} />}
            {isEdit ? 'Guardar cambios' : form.mode === 'published' ? 'Publicar noticia' : form.mode === 'scheduled' ? 'Programar noticia' : 'Guardar como oculta'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default NoticesFormPage;
