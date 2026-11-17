import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminLayout from '../components/AdminLayout';
import CoverField from '../cms/editor/CoverField';
import { Field, fieldClass } from '../cms/editor/editors/fields';
import NoticePicker from '../cms/events/admin/NoticePicker';
import {
  createEventEditionRequest, getEventEditionRequest, getEventSeriesRequest, updateEventEditionRequest,
} from '../api/events';
import { getApiErrors } from '../api/errors';
import { invalidateEventSeries } from '../cms/events/useEventSeries';
import { editionFormToPayload, editionToForm, emptyEditionForm, numeralPreview, validateEditionForm } from '../cms/events/eventForm';
import { formatEventDates } from '../cms/events/eventFormat';
import { fromLimaInput } from '../utils/noticeDate';

const SUMMARY_MAX = 1500;
const cardClass = 'rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-7';

const API_MESSAGES = {
  'That series already has an edition with that number': 'Ese evento ya tiene una edición con ese número.',
  'Event series not found': 'El evento elegido ya no existe. Recarga la página.',
  'Image not found': 'La portada ya no está en el servidor. Súbela de nuevo.',
  'Notice not found': 'Una de las noticias elegidas ya no existe. Quítala y vuelve a guardar.',
  'The end needs a start date': 'Para indicar el fin, indica también el inicio.',
  'The end cannot be before the start': 'El fin no puede ser antes del inicio.',
};

const Section = ({ title, description, children }) => (
  <section className={cardClass}>
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    <div className="mt-5 space-y-5">{children}</div>
  </section>
);

const Toggle = ({ checked, onChange, title, description }) => (
  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 transition hover:border-sky-200">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
    <span>
      <span className="block font-semibold text-slate-900">{title}</span>
      <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
    </span>
  </label>
);

/* Crear o editar una edición de un evento */
const EventEditionFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState([]);
  const [form, setForm] = useState(() => emptyEditionForm(searchParams.get('serie') ?? ''));
  const [saved, setSaved] = useState(() => JSON.stringify(emptyEditionForm(searchParams.get('serie') ?? '')));
  const [loadState, setLoadState] = useState('loading');
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);

  const set = (changes) => setForm((current) => ({ ...current, ...changes }));
  const dirty = useMemo(() => JSON.stringify(form) !== saved, [form, saved]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getEventSeriesRequest(), isEdit ? getEventEditionRequest(id) : Promise.resolve(null)])
      .then(([seriesResponse, editionResponse]) => {
        if (cancelled) return;
        setSeries(seriesResponse.data);
        if (editionResponse) {
          const loaded = editionToForm(editionResponse.data);
          setForm(loaded);
          setSaved(JSON.stringify(loaded));
        } else if (seriesResponse.data.length === 1) {
          setForm((current) => (current.serie ? current : { ...current, serie: seriesResponse.data[0]._id }));
        }
        setLoadState('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadState(error.response?.status === 404 ? 'notfound' : 'error');
      });
    return () => { cancelled = true; };
  }, [id, isEdit]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const selectedSeries = series.find((item) => item._id === form.serie);
  const numeral = numeralPreview(form);
  const datesPreview = formatEventDates(fromLimaInput(form.fechaInicio), fromLimaInput(form.fechaFin));

  const goBack = async () => {
    if (dirty) {
      const result = await Swal.fire({ title: '¿Salir sin guardar?', text: 'Los cambios de esta edición se perderán.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Salir', confirmButtonColor: '#dc2626', cancelButtonText: 'Seguir editando', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });
      if (!result.isConfirmed) return;
    }
    navigate('/events');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const problems = validateEditionForm(form);
    setErrors(problems);
    if (problems.length) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      const payload = editionFormToPayload(form);
      if (isEdit) await updateEventEditionRequest(id, payload);
      else await createEventEditionRequest(payload);
      invalidateEventSeries();
      setSaved(JSON.stringify(form));
      await Swal.fire({ title: isEdit ? 'Edición actualizada' : 'Edición creada', icon: 'success', timer: 1400, showConfirmButton: false });
      navigate('/events');
    } catch (error) {
      setErrors(getApiErrors(error, 'No se pudo guardar la edición').map((message) => API_MESSAGES[message] ?? message));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const title = isEdit ? 'Editar edición' : 'Nueva edición';

  if (loadState !== 'ready') {
    return (
      <AdminLayout title={title}>
        {loadState === 'loading' && <div className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />}
        {loadState === 'notfound' && <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">No encontramos esta edición. <Link to="/events" className="font-semibold text-primary">Volver a eventos</Link></p>}
        {loadState === 'error' && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">No se pudo cargar la información. Recarga la página.</p>}
      </AdminLayout>
    );
  }

  if (series.length === 0) {
    return (
      <AdminLayout title={title}>
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Primero crea un evento (por ejemplo, la JEPA). <Link to="/events" className="font-semibold text-primary">Ir a eventos</Link></p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={title}
      description="Cada edición guarda su propio sitio, fechas y portada. Marca como vigente la edición que debe enlazar el menú del sitio."
      action={<button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:text-primary"><ArrowLeft size={17} aria-hidden="true" /> Volver</button>}
    >
      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-4xl space-y-6">
        {errors.length > 0 && (
          <ul role="alert" className="space-y-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.map((message) => <li key={message}>{message}</li>)}
          </ul>
        )}

        <Section title="Evento y número">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem_10rem]">
            <Field label="Evento *">
              <select value={form.serie} onChange={(event) => set({ serie: event.target.value })} className={fieldClass} required>
                <option value="">Elige un evento</option>
                {series.map((item) => <option key={item._id} value={item._id}>{item.sigla} — {item.nombre}</option>)}
              </select>
            </Field>
            <Field label="Número *">
              <input type="number" min={1} max={999} step={1} value={form.numero} onChange={(event) => set({ numero: event.target.value })} className={fieldClass} required />
            </Field>
            <Field label="Numeral" hint="Vacío: se calcula solo.">
              <input value={form.numeral} maxLength={15} placeholder={numeralPreview({ ...form, numeral: '' }) || 'VIII'} onChange={(event) => set({ numeral: event.target.value.toUpperCase() })} className={fieldClass} />
            </Field>
          </div>
          <p className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-inset ring-sky-100">
            En el menú se verá como <strong className="text-primary">{[numeral, selectedSeries?.sigla].filter(Boolean).join(' ') || '—'}</strong>
          </p>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <Field label="Título" hint={`Opcional. Si lo dejas vacío se muestra «${[numeral, selectedSeries?.sigla].filter(Boolean).join(' ') || 'VIII JEPA'}».`}>
              <input value={form.titulo} maxLength={200} onChange={(event) => set({ titulo: event.target.value })} className={fieldClass} />
            </Field>
            <Field label="Semestre" hint="Ej.: 2026-II">
              <input value={form.semestre} maxLength={7} placeholder="2026-II" onChange={(event) => set({ semestre: event.target.value.toUpperCase() })} className={fieldClass} />
            </Field>
          </div>
        </Section>

        <Section title="Fecha y lugar" description="En hora de Lima. Si solo se conoce el día, deja la hora en 00:00 y el fin vacío.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Inicio">
              <input type="datetime-local" value={form.fechaInicio} onChange={(event) => set({ fechaInicio: event.target.value })} className={fieldClass} />
            </Field>
            <Field label="Fin" hint="Opcional.">
              <input type="datetime-local" value={form.fechaFin} min={form.fechaInicio || undefined} onChange={(event) => set({ fechaFin: event.target.value })} className={fieldClass} />
            </Field>
          </div>
          {datesPreview && <p className="text-sm text-slate-500">Se mostrará: <span className="font-semibold text-slate-700">{datesPreview}</span></p>}
          <Field label="Sede">
            <input value={form.sede} maxLength={200} placeholder="Casa de la Cultura – San Vicente de Cañete" onChange={(event) => set({ sede: event.target.value })} className={fieldClass} />
          </Field>
        </Section>

        <Section title="Sitio y portada">
          <Field label="Sitio de esta edición" hint="El sitio archivado de la edición, p. ej. https://jepa-vii.episundc.pe/. Para la vigente puede ser la dirección permanente.">
            <input type="url" value={form.url} maxLength={2048} placeholder="https://" onChange={(event) => set({ url: event.target.value })} className={fieldClass} />
          </Field>
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-600">Portada o afiche</p>
            <CoverField
              url={form.portada}
              alt={form.portadaAlt}
              onUrlChange={(portada) => set({ portada })}
              onAltChange={(portadaAlt) => set({ portadaAlt })}
              onBusyChange={setCoverBusy}
            />
          </div>
        </Section>

        <Section title="Resumen" description="Texto plano: una o dos frases sobre la edición.">
          <Field label="Resumen" hint={`${form.resumen.length}/${SUMMARY_MAX}`}>
            <textarea value={form.resumen} maxLength={SUMMARY_MAX} rows={4} onChange={(event) => set({ resumen: event.target.value })} className={fieldClass} />
          </Field>
        </Section>

        <Section title="Noticias relacionadas" description="Aparecen en la historia de la edición, en la página del evento.">
          <NoticePicker value={form.noticias} onChange={(noticias) => set({ noticias })} />
        </Section>

        <Section title="Publicación">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              checked={form.destacada}
              onChange={(destacada) => set({ destacada })}
              title="Edición vigente"
              description="El menú y la portada muestran su numeral. Solo puede haber una por evento: al marcarla se desmarca la anterior."
            />
            <Toggle
              checked={form.hidden}
              onChange={(hidden) => set({ hidden })}
              title="Ocultar del sitio"
              description="Queda guardada en el panel pero no se ve en la página de eventos."
            />
          </div>
        </Section>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={goBack} disabled={saving} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">Cancelar</button>
          <button type="submit" disabled={saving || coverBusy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,129,234,0.22)] transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60">
            {saving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {isEdit ? 'Guardar cambios' : 'Crear edición'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default EventEditionFormPage;
