import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Newspaper, Plus, Search, SlidersHorizontal, Tags, X } from 'lucide-react';
import { useNotices } from '../context/NoticesContext';
import { useAuth } from '../context/AuthContext';
import NoticeCard from '../components/NoticeCard';
import CategoriesModal from '../components/CategoriesModal';
import AdminLayout from '../components/AdminLayout';
import { getCategoriesRequest } from '../api/categories';

const PAGE_SIZE = 12;

const statusTabs = [
  { key: '', label: 'Todas', stat: 'total' },
  { key: 'published', label: 'Publicadas', stat: 'published' },
  { key: 'scheduled', label: 'Programadas', stat: 'scheduled' },
  { key: 'hidden', label: 'Ocultas', stat: 'hidden' },
];

const sortOptions = [
  { value: 'date_desc', label: 'Más recientes' },
  { value: 'date_asc', label: 'Más antiguas' },
  { value: 'title_asc', label: 'Título (A-Z)' },
];

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100';

const NoticesPage = () => {
  const { notices, pageInfo, stats, loading, errors, getNotices, getStats } = useNotices();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // los filtros viven en la URL: se conservan al editar una noticia y volver
  const filters = {
    q: searchParams.get('q') ?? '',
    status: searchParams.get('status') ?? '',
    category: searchParams.get('category') ?? '',
    featured: searchParams.get('featured') === '1',
    from: searchParams.get('from') ?? '',
    to: searchParams.get('to') ?? '',
    sort: searchParams.get('sort') ?? 'date_desc',
  };
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const [searchText, setSearchText] = useState(filters.q);

  const updateParams = useCallback((changes) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (!('page' in changes)) next.delete('page');
      Object.entries(changes).forEach(([key, value]) => {
        if (value === '' || value === false || value === undefined || (key === 'page' && value === 1)) next.delete(key);
        else next.set(key, value === true ? '1' : String(value));
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // la búsqueda por texto espera a que se deje de escribir
  useEffect(() => {
    if (searchText === filters.q) return undefined;
    const timer = setTimeout(() => updateParams({ q: searchText.trim() }), 350);
    return () => clearTimeout(timer);
  }, [searchText, filters.q, updateParams]);

  useEffect(() => { setSearchText(filters.q); }, [filters.q]);

  const requestParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    sort: filters.sort,
    ...(filters.q && { q: filters.q }),
    ...(filters.status && { status: filters.status }),
    ...(filters.category && { category: filters.category }),
    ...(filters.featured && { featured: 1 }),
    ...(filters.from && { from: filters.from }),
    ...(filters.to && { to: filters.to }),
  }), [page, filters.sort, filters.q, filters.status, filters.category, filters.featured, filters.from, filters.to]);

  useEffect(() => { getNotices(requestParams); }, [getNotices, requestParams]);
  useEffect(() => { getStats(); }, [getStats]);

  const loadCategories = useCallback(async () => {
    try {
      setCategories((await getCategoriesRequest()).data);
    } catch (error) {
      // sin categorías el filtro simplemente no se ofrece
    }
  }, []);
  useEffect(() => { loadCategories(); }, [loadCategories]);

  const totalPages = Math.max(1, Math.ceil(pageInfo.total / pageInfo.limit));

  // si al eliminar queda vacía la última página se vuelve a la anterior
  useEffect(() => {
    if (!loading && notices.length === 0 && page > 1 && pageInfo.total > 0) updateParams({ page: totalPages });
  }, [loading, notices.length, page, pageInfo.total, totalPages, updateParams]);

  const hasFilters = Boolean(filters.q || filters.status || filters.category || filters.featured || filters.from || filters.to);
  const advancedActive = Boolean(filters.category || filters.featured || filters.from || filters.to);
  const clearFilters = () => { setSearchText(''); setSearchParams({}, { replace: true }); };
  const refresh = () => { getStats(); loadCategories(); };

  const firstLoad = loading && notices.length === 0 && pageInfo.total === 0;

  return (
    <AdminLayout
      title="Noticias"
      description="Gestiona las publicaciones que aparecen en la portada y en la sección de actualidad."
      action={
        <div className="flex flex-wrap gap-3">
          {user?.role === 'admin' && <button type="button" onClick={() => setShowCategories(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-primary"><Tags size={18} /> Categorías</button>}
          <Link to="/add-notice" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,129,234,0.22)] transition hover:bg-secondary"><Plus size={18} /> Nueva noticia</Link>
        </div>
      }
    >
      <section aria-label="Filtros" className="mb-6 space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block flex-1">
            <span className="sr-only">Buscar noticias</span>
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Buscar por título o contenido…" className={`${fieldClass} pl-10`} />
          </label>
          <label className="block sm:w-52">
            <span className="sr-only">Ordenar por</span>
            <select value={filters.sort} onChange={(event) => updateParams({ sort: event.target.value === 'date_desc' ? '' : event.target.value })} className={fieldClass}>
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => setShowMore((current) => !current)} aria-expanded={showMore} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${advancedActive ? 'border-sky-300 bg-sky-50 text-primary' : 'border-slate-200 text-slate-700 hover:border-sky-200'}`}><SlidersHorizontal size={16} /> Más filtros{advancedActive && ' •'}</button>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
          {statusTabs.map((tab) => (
            <button key={tab.key} type="button" aria-pressed={filters.status === tab.key} onClick={() => updateParams({ status: tab.key })} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filters.status === tab.key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {tab.label}{stats && <span className={`ml-2 text-xs ${filters.status === tab.key ? 'text-sky-100' : 'text-slate-500'}`}>{stats[tab.stat]}</span>}
            </button>
          ))}
        </div>

        {(showMore || advancedActive) && (
          <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs font-semibold text-slate-600">Categoría
              <select value={filters.category} onChange={(event) => updateParams({ category: event.target.value })} className={`${fieldClass} mt-1.5`}>
                <option value="">Todas</option>
                <option value="none">Sin categoría</option>
                {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-600">Desde
              <input type="date" value={filters.from} max={filters.to || undefined} onChange={(event) => updateParams({ from: event.target.value })} className={`${fieldClass} mt-1.5`} />
            </label>
            <label className="block text-xs font-semibold text-slate-600">Hasta
              <input type="date" value={filters.to} min={filters.from || undefined} onChange={(event) => updateParams({ to: event.target.value })} className={`${fieldClass} mt-1.5`} />
            </label>
            <label className="flex items-end gap-2 pb-2.5 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={filters.featured} onChange={(event) => updateParams({ featured: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-sky-200" />
              Solo destacadas
            </label>
          </div>
        )}

        {hasFilters && (
          <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
            <span aria-live="polite">{pageInfo.total} {pageInfo.total === 1 ? 'resultado' : 'resultados'}</span>
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-secondary"><X size={15} /> Limpiar filtros</button>
          </div>
        )}
      </section>

      {errors.length > 0 && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors.map((error) => <p key={error}>{error}</p>)}</div>}

      {firstLoad ? (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-96 animate-pulse rounded-[1.5rem] bg-slate-100" />)}
        </div>
      ) : notices.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-primary"><Newspaper size={27} /></span>
          <h2 className="text-lg font-bold text-slate-900">{hasFilters ? 'Ninguna noticia coincide con los filtros' : 'Aún no hay noticias'}</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">{hasFilters ? 'Prueba con otra búsqueda o limpia los filtros.' : 'Crea la primera publicación para comenzar a mostrar contenido en el portal.'}</p>
          {hasFilters && <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary">Limpiar filtros</button>}
        </div>
      ) : (
        <div className={`grid gap-5 transition-opacity md:grid-cols-2 2xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
          {notices.map((notice) => <NoticeCard notice={notice} key={notice._id} onChanged={refresh} />)}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Paginación de noticias">
          <button type="button" disabled={page <= 1} onClick={() => updateParams({ page: page - 1 })} aria-label="Página anterior" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-sky-200 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={18} /></button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
            <button key={number} type="button" onClick={() => updateParams({ page: number })} aria-current={number === pageInfo.page ? 'page' : undefined} className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition ${number === pageInfo.page ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-sky-200'}`}>{number}</button>
          ))}
          <button type="button" disabled={page >= totalPages} onClick={() => updateParams({ page: page + 1 })} aria-label="Página siguiente" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-sky-200 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={18} /></button>
        </nav>
      )}

      {showCategories && <CategoriesModal onClose={() => setShowCategories(false)} onChanged={refresh} />}
    </AdminLayout>
  );
};

export default NoticesPage;
