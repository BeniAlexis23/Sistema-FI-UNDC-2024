import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Search, X } from 'lucide-react';
import { getNoticesPageRequest, getNoticiasRequest } from '../../../api/notices';
import { formatShortDate } from '../../../utils/noticeDate';
import { fieldClass } from '../../editor/editors/fields';

export const MAX_LINKED_NOTICES = 20;
const RECENT_LIMIT = 50;
const SEARCH_DELAY_MS = 350;

const normalize = (value = '') => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const mergeNotices = (...lists) => {
  const byId = new Map();
  lists.flat().forEach((notice) => {
    if (notice?._id && !byId.has(notice._id)) byId.set(notice._id, { _id: notice._id, title: notice.title, date: notice.date, status: notice.status });
  });
  return [...byId.values()].sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0));
};

/* Noticias relacionadas con una edición. Ofrece las más recientes del portal (de todos los autores) y las del panel;
   al escribir, busca también en el panel (el administrador ve todas, el editor las suyas). En el sitio solo se muestran las públicas. */
const NoticePicker = ({ value, onChange }) => {
  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState('');
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      getNoticiasRequest({ limit: RECENT_LIMIT, sort: 'date_desc' }),
      getNoticesPageRequest({ limit: RECENT_LIMIT, sort: 'date_desc' }),
    ]).then(([publicList, panelList]) => {
      const lists = [
        publicList.status === 'fulfilled' && Array.isArray(publicList.value.data) ? publicList.value.data : [],
        panelList.status === 'fulfilled' ? panelList.value.data?.items ?? [] : [],
      ];
      setFailed(publicList.status === 'rejected' && panelList.status === 'rejected');
      setOptions((current) => mergeNotices(current, ...lists));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    const text = query.trim();
    if (text.length < 3) return undefined;
    const timer = setTimeout(() => {
      getNoticesPageRequest({ q: text, limit: 20, sort: 'date_desc' })
        .then(({ data }) => setOptions((current) => mergeNotices(current, data?.items ?? [])))
        .catch(() => {});
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const selectedIds = useMemo(() => new Set(value.map((notice) => notice._id)), [value]);
  const filtered = useMemo(() => {
    const text = normalize(query.trim());
    return options.filter((notice) => !text || normalize(notice.title).includes(text)).slice(0, 30);
  }, [options, query]);

  const toggle = (notice) => {
    if (selectedIds.has(notice._id)) onChange(value.filter((item) => item._id !== notice._id));
    else if (value.length < MAX_LINKED_NOTICES) onChange([...value, { _id: notice._id, title: notice.title }]);
  };

  return (
    <div className="space-y-3">
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Noticias elegidas">
          {value.map((notice) => (
            <li key={notice._id} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-sky-50 py-1 pl-3 pr-1 text-xs font-semibold text-primary ring-1 ring-inset ring-sky-100">
              <span className="truncate">{notice.title ?? 'Noticia eliminada'}</span>
              <button type="button" onClick={() => onChange(value.filter((item) => item._id !== notice._id))} aria-label={`Quitar «${notice.title ?? 'noticia'}»`} className="rounded-full p-1 transition hover:bg-sky-100">
                <X size={12} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">Ninguna noticia elegida.</p>
      )}

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar noticia por título" aria-label="Buscar noticia por título" className={`${fieldClass} pl-9`} />
      </div>

      {failed && <p className="text-sm text-amber-700">No se pudieron cargar las noticias. Puedes guardar la edición y elegirlas después.</p>}

      <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200" aria-label="Noticias disponibles">
        {filtered.length === 0 && <li className="p-4 text-center text-sm text-slate-500">{!loaded ? 'Cargando noticias…' : query ? 'No hay noticias con ese título.' : 'No hay noticias para elegir.'}</li>}
        {filtered.map((notice) => {
          const selected = selectedIds.has(notice._id);
          const full = !selected && value.length >= MAX_LINKED_NOTICES;
          return (
            <li key={notice._id}>
              <button
                type="button"
                onClick={() => toggle(notice)}
                disabled={full}
                aria-pressed={selected}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'bg-sky-50 text-primary' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? 'border-primary bg-primary text-white' : 'border-slate-300'}`} aria-hidden="true">
                  {selected ? <Check size={13} /> : <Plus size={12} className="text-slate-400" />}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{notice.title}</span>
                {notice.status && notice.status !== 'published' && <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-700">{notice.status === 'hidden' ? 'Oculta' : 'Programada'}</span>}
                <span className="shrink-0 text-xs text-slate-400">{formatShortDate(notice.date)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-[0.7rem] text-slate-400">Hasta {MAX_LINKED_NOTICES} noticias. En el sitio solo aparecen las que están publicadas.</p>
    </div>
  );
};

export default NoticePicker;
