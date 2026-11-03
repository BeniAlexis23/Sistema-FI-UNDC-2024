import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FilePlus2, FileText, Newspaper } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getNoticeStatsRequest } from '../api/notices';
import { getResolucionesRequest } from '../api/rcfs';
import { useAuth } from '../context/AuthContext';

const noticeBreakdown = (stats) => (
  stats.total === 0
    ? null
    : `${stats.published} publicadas · ${stats.scheduled} programadas · ${stats.hidden} ocultas`
);

const Dashboard = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ notices: 0, rcfs: 0 });
  const [noticeStats, setNoticeStats] = useState({ total: 0, published: 0, scheduled: 0, hidden: 0 });

  useEffect(() => {
    const loadCounts = async () => {
      // las noticias se cuentan con el endpoint del panel: incluye ocultas y programadas
      const results = await Promise.allSettled([getNoticeStatsRequest(), getResolucionesRequest()]);
      if (results[0].status === 'fulfilled') {
        setNoticeStats(results[0].value.data);
        setCounts((current) => ({ ...current, notices: results[0].value.data.total }));
      }
      if (results[1].status === 'fulfilled') {
        setCounts((current) => ({ ...current, rcfs: results[1].value.data.length }));
      }
    };
    loadCounts();
  }, []);

  const modules = [
    { label: 'Noticias', description: 'Publicaciones y comunicados del portal.', detail: noticeBreakdown(noticeStats), count: counts.notices, icon: Newspaper, to: '/notices', addTo: '/add-notice', accent: 'bg-sky-50 text-primary' },
    { label: 'Resoluciones', description: 'Resoluciones del Consejo de Facultad.', count: counts.rcfs, icon: FileText, to: '/rcfs', addTo: '/add-rcf', accent: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <AdminLayout title={`Hola, ${user?.username || 'usuario'}`} description="Aquí tienes una vista general del contenido institucional y accesos rápidos para mantenerlo actualizado.">
      <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-blue-600 to-blue-700 p-6 text-white shadow-[0_24px_55px_rgba(16,129,234,0.2)] sm:p-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-100">Resumen del portal</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Contenido claro, vigente y accesible</h2>
          <p className="mt-3 text-sm leading-6 text-blue-50 sm:text-base">Administra las publicaciones desde un único lugar. Los cambios se reflejan en el sitio público según tus permisos.</p>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {modules.map(({ label, description, detail, count, icon: Icon, to, addTo, accent }) => (
          <article key={label} className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_22px_50px_rgba(15,23,42,0.09)]">
            <div className="flex items-start justify-between gap-4">
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}><Icon size={24} /></span>
              <span className="text-3xl font-bold tracking-tight text-slate-950">{count}</span>
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900">{label}</h3>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{description}</p>
            {detail && <p className="mt-1 text-xs font-semibold text-slate-400">{detail}</p>}
            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
              <Link to={to} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">Ver listado <ArrowRight size={16} /></Link>
              <Link to={addTo} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary"><FilePlus2 size={16} /> Nuevo</Link>
            </div>
          </article>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
