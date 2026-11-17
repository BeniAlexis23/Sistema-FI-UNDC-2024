import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ExternalLink, Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminLayout from '../components/AdminLayout';
import {
  deleteEventEditionRequest, deleteEventSeriesRequest, getEventEditionsRequest, getEventSeriesRequest,
  setEventEditionDestacadaRequest, setEventEditionVisibilityRequest,
} from '../api/events';
import { getApiErrors } from '../api/errors';
import SeriesFormModal from '../cms/events/admin/SeriesFormModal';
import { invalidateEventSeries } from '../cms/events/useEventSeries';
import { displayHost, editionTitle, formatEventDates, statusInfo } from '../cms/events/eventFormat';
import { SeriesMark, seriesColor } from '../cms/events/EventVisuals';

const iconButton = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40';
const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,129,234,0.22)] transition hover:bg-secondary';
const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-primary';

const confirm = (title, text) => Swal.fire({ title, text, icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', confirmButtonColor: '#dc2626', cancelButtonText: 'Cancelar', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });

const EditionStatus = ({ edition }) => {
  if (edition.hidden) return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">Oculta</span>;
  const status = statusInfo(edition.estado);
  if (!status) return <span className="text-xs text-slate-400">Sin fecha</span>;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${status.className}`}>{status.label}</span>;
};

const EditionsTable = ({ series, editions, busyId, onToggleFeatured, onToggleHidden, onDelete }) => {
  if (editions.length === 0) {
    return <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">Este evento todavía no tiene ediciones.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[46rem] text-left text-sm">
        <caption className="sr-only">Ediciones de {series.sigla}</caption>
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-3 py-2.5">Edición</th>
            <th scope="col" className="px-3 py-2.5">Semestre</th>
            <th scope="col" className="px-3 py-2.5">Fechas (Lima)</th>
            <th scope="col" className="px-3 py-2.5">Estado</th>
            <th scope="col" className="px-3 py-2.5 text-center">Vigente</th>
            <th scope="col" className="px-3 py-2.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {editions.map((edition) => {
            const busy = busyId === edition._id;
            const label = editionTitle(edition, series);
            return (
              <tr key={edition._id} className={edition.hidden ? 'bg-slate-50/60 text-slate-500' : 'bg-white'}>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-12 shrink-0 text-lg font-black text-slate-800">{edition.numeral}</span>
                    <div className="min-w-0">
                      <p className="max-w-[16rem] truncate font-semibold text-slate-900">{label}</p>
                      {edition.url && <a href={edition.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{displayHost(edition.url)}</a>}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-600">{edition.semestre || '—'}</td>
                <td className="px-3 py-3 text-slate-600">{formatEventDates(edition.fechaInicio, edition.fechaFin) || '—'}</td>
                <td className="px-3 py-3"><EditionStatus edition={edition} /></td>
                <td className="px-3 py-3 text-center">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onToggleFeatured(edition)}
                    aria-pressed={edition.destacada}
                    aria-label={edition.destacada ? `Quitar ${label} como edición vigente` : `Marcar ${label} como edición vigente`}
                    title={edition.destacada ? 'Edición vigente (la enlaza el menú)' : 'Marcar como vigente'}
                    className={`${iconButton} ${edition.destacada ? 'text-amber-500 hover:text-amber-600' : ''}`}
                  >
                    <Star size={18} fill={edition.destacada ? 'currentColor' : 'none'} aria-hidden="true" />
                  </button>
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-0.5">
                    <button type="button" disabled={busy} onClick={() => onToggleHidden(edition)} aria-label={edition.hidden ? `Mostrar ${label}` : `Ocultar ${label}`} title={edition.hidden ? 'Mostrar en el sitio' : 'Ocultar del sitio'} className={iconButton}>
                      {edition.hidden ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                    </button>
                    <Link to={`/event-editions/${edition._id}`} aria-label={`Editar ${label}`} title="Editar" className={iconButton}><Pencil size={16} aria-hidden="true" /></Link>
                    <button type="button" disabled={busy} onClick={() => onDelete(edition)} aria-label={`Eliminar ${label}`} title="Eliminar" className={`${iconButton} hover:text-red-600`}><Trash2 size={16} aria-hidden="true" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* Catálogo de eventos (administradores y editores): series y sus ediciones */
const EventosAdminPage = () => {
  const [series, setSeries] = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editor, setEditor] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const messageTimer = useRef(null);

  const flash = useCallback((text) => {
    setMessage(text);
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(''), 5000);
  }, []);
  useEffect(() => () => clearTimeout(messageTimer.current), []);

  const load = useCallback(async () => {
    try {
      const [seriesResponse, editionsResponse] = await Promise.all([getEventSeriesRequest(), getEventEditionsRequest()]);
      setSeries(seriesResponse.data);
      setEditions(editionsResponse.data);
      setError('');
    } catch (requestError) {
      setError(getApiErrors(requestError, 'No se pudieron cargar los eventos')[0]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const editionsBySeries = useMemo(() => {
    const groups = new Map();
    editions.forEach((edition) => {
      const key = edition.serie?._id;
      groups.set(key, [...(groups.get(key) ?? []), edition]);
    });
    return groups;
  }, [editions]);

  const changed = (text) => {
    invalidateEventSeries();
    if (text) flash(text);
  };

  const runOnEdition = async (edition, action, failure) => {
    setBusyId(edition._id);
    setError('');
    try {
      await action();
    } catch (requestError) {
      setError(getApiErrors(requestError, failure)[0]);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const toggleFeatured = (edition) => runOnEdition(edition, async () => {
    const { data } = await setEventEditionDestacadaRequest(edition._id, !edition.destacada);
    const updated = new Map(data.map((item) => [item._id, item]));
    setEditions((current) => current.map((item) => updated.get(item._id) ?? item));
    changed(edition.destacada ? 'La edición dejó de ser la vigente.' : `${edition.numeral} ${edition.serie?.sigla ?? ''} es ahora la edición vigente: el menú enlaza a ella.`);
  }, 'No se pudo cambiar la edición vigente');

  const toggleHidden = (edition) => runOnEdition(edition, async () => {
    const { data } = await setEventEditionVisibilityRequest(edition._id, !edition.hidden);
    setEditions((current) => current.map((item) => (item._id === data._id ? data : item)));
    changed(data.hidden ? 'La edición quedó oculta del sitio.' : 'La edición vuelve a verse en el sitio.');
  }, 'No se pudo cambiar la visibilidad');

  const deleteEdition = async (edition) => {
    const result = await confirm('¿Eliminar esta edición?', `Se borrará la edición ${edition.numeral} con su portada. Esta acción no se puede deshacer.`);
    if (!result.isConfirmed) return;
    runOnEdition(edition, async () => {
      await deleteEventEditionRequest(edition._id);
      setEditions((current) => current.filter((item) => item._id !== edition._id));
      setSeries((current) => current.map((item) => (item._id === edition.serie?._id ? { ...item, totalEdiciones: item.totalEdiciones - 1 } : item)));
      changed('Edición eliminada.');
    }, 'No se pudo eliminar la edición');
  };

  const deleteSeries = async (item) => {
    if (item.totalEdiciones > 0) {
      Swal.fire({ title: 'Este evento tiene ediciones', text: 'Primero elimina sus ediciones, o desactívalo para que deje de aparecer en el sitio.', icon: 'info', confirmButtonColor: '#1081ea' });
      return;
    }
    const result = await confirm(`¿Eliminar ${item.sigla}?`, 'Se borrará el evento y su logo. Esta acción no se puede deshacer.');
    if (!result.isConfirmed) return;
    setBusyId(item._id);
    try {
      await deleteEventSeriesRequest(item._id);
      setSeries((current) => current.filter((entry) => entry._id !== item._id));
      changed('Evento eliminado.');
    } catch (requestError) {
      setError(requestError.response?.data?.code === 'SERIES_HAS_EDITIONS'
        ? 'Este evento tiene ediciones: elimínalas primero o desactívalo.'
        : getApiErrors(requestError, 'No se pudo eliminar el evento')[0]);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const handleSeriesSaved = (saved) => {
    setEditor(null);
    setSeries((current) => {
      const exists = current.some((item) => item._id === saved._id);
      const next = exists ? current.map((item) => (item._id === saved._id ? saved : item)) : [...current, saved];
      return [...next].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es'));
    });
    // la sigla pudo cambiar: las ediciones la muestran
    load();
    changed(editor?.series ? 'Evento actualizado.' : 'Evento creado. Ahora agrégale su primera edición.');
  };

  return (
    <AdminLayout
      title="Eventos"
      description="Congresos, jornadas y ferias de la Facultad. El menú «Eventos» del sitio enlaza a la dirección permanente de cada evento activo y muestra el numeral de su edición vigente (la marcada con estrella)."
      action={(
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setEditor({ series: null })} className={secondaryButton}><Plus size={17} aria-hidden="true" /> Nuevo evento</button>
          {series.length > 0 && <Link to="/add-event-edition" className={primaryButton}><Plus size={17} aria-hidden="true" /> Nueva edición</Link>}
        </div>
      )}
    >
      <div aria-live="polite" className="space-y-3">
        {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</p>}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      </div>

      {loading && (
        <div className="mt-4 space-y-4" aria-hidden="true">
          {Array.from({ length: 2 }, (_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      )}

      {!loading && series.length === 0 && !error && (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <CalendarDays size={32} className="mx-auto text-slate-300" aria-hidden="true" />
          <p className="mt-3 font-semibold text-slate-800">Aún no hay eventos.</p>
          <p className="mt-1 text-sm text-slate-500">Mientras tanto, el menú del sitio muestra los enlaces de siempre.</p>
          <button type="button" onClick={() => setEditor({ series: null })} className={`${primaryButton} mt-5`}><Plus size={17} aria-hidden="true" /> Crear el primer evento</button>
        </div>
      )}

      <div className="mt-4 space-y-6">
        {series.map((item, index) => {
          const itemEditions = editionsBySeries.get(item._id) ?? [];
          return (
            <section key={item._id} aria-labelledby={`series-${item._id}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <SeriesMark series={item} color={seriesColor(item, index)} size="sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 id={`series-${item._id}`} className="text-lg font-bold text-slate-900">{item.sigla}</h2>
                      {!item.activo && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">Inactivo</span>}
                      <span className="text-xs text-slate-400">Orden {item.orden}</span>
                    </div>
                    <p className="text-sm text-slate-600">{item.nombre}</p>
                    <a href={item.urlPermanente} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      <span className="truncate">{displayHost(item.urlPermanente)}</span> <ExternalLink size={12} className="shrink-0" aria-hidden="true" />
                    </a>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  <Link to={`/add-event-edition?serie=${item._id}`} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary transition hover:bg-sky-50"><Plus size={16} aria-hidden="true" /> Edición</Link>
                  <button type="button" onClick={() => setEditor({ series: item })} aria-label={`Editar ${item.sigla}`} title="Editar evento" className={iconButton}><Pencil size={16} aria-hidden="true" /></button>
                  <button type="button" disabled={busyId === item._id} onClick={() => deleteSeries(item)} aria-label={`Eliminar ${item.sigla}`} title="Eliminar evento" className={`${iconButton} hover:text-red-600`}><Trash2 size={16} aria-hidden="true" /></button>
                </div>
              </header>
              <div className="mt-5">
                <EditionsTable
                  series={item}
                  editions={itemEditions}
                  busyId={busyId}
                  onToggleFeatured={toggleFeatured}
                  onToggleHidden={toggleHidden}
                  onDelete={deleteEdition}
                />
              </div>
            </section>
          );
        })}
      </div>

      {editor && <SeriesFormModal series={editor.series} onClose={() => setEditor(null)} onSaved={handleSeriesSaved} />}
    </AdminLayout>
  );
};

export default EventosAdminPage;
