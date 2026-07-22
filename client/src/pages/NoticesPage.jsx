import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Plus } from 'lucide-react';
import { useNotices } from '../context/NoticesContext';
import NoticeCard from '../components/NoticeCard';
import AdminLayout from '../components/AdminLayout';

const NoticesPage = () => {
  const { getNotices, notices } = useNotices();

  useEffect(() => { getNotices(); }, [getNotices]);

  return (
    <AdminLayout
      title="Noticias"
      description="Gestiona las publicaciones que aparecen en la portada y en la sección de actualidad."
      action={<Link to="/add-notice" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,129,234,0.22)] transition hover:bg-secondary"><Plus size={18} /> Nueva noticia</Link>}
    >
      {notices.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-primary"><Newspaper size={27} /></span>
          <h2 className="text-lg font-bold text-slate-900">Aún no hay noticias</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">Crea la primera publicación para comenzar a mostrar contenido en el portal.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {notices.map((notice) => <NoticeCard notice={notice} key={notice._id} />)}
        </div>
      )}
    </AdminLayout>
  );
};

export default NoticesPage;
