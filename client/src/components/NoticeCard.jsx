import { Link } from 'react-router-dom';
import { CalendarDays, Pencil, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Swal from 'sweetalert2';
import { useNotices } from '../context/NoticesContext';
import { assetUrl } from '../utils/assetUrl';

dayjs.extend(utc);

const truncateText = (text = '', maxLength) => text.length <= maxLength ? text : `${text.slice(0, maxLength)}…`;

const NoticeCard = ({ notice }) => {
  const { deleteNotice } = useNotices();

  const handleDelete = async () => {
    const result = await Swal.fire({ title: '¿Eliminar noticia?', text: 'Esta acción no se puede revertir.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', confirmButtonColor: '#dc2626', cancelButtonText: 'Cancelar', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });
    if (!result.isConfirmed) return;
    try {
      await deleteNotice(notice._id);
      Swal.fire({ title: 'Noticia eliminada', icon: 'success', confirmButtonColor: '#1081ea' });
    } catch {
      Swal.fire({ title: 'No se pudo eliminar', text: 'Inténtalo nuevamente.', icon: 'error', confirmButtonColor: '#1081ea' });
    }
  };

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_22px_50px_rgba(15,23,42,0.09)]">
      <div className="h-48 overflow-hidden bg-slate-100">
        <img src={assetUrl(notice.imageUrl)} alt={notice.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500"><CalendarDays size={15} /><span>{dayjs(notice.date).utc().format('DD/MM/YYYY')}</span></div>
        <h2 className="text-lg font-bold leading-snug text-slate-900">{truncateText(notice.title, 65)}</h2>
        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{truncateText(notice.description, 115)}</p>
        <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
          <Link to={`/notices/${notice._id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-50 px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-sky-100"><Pencil size={16} /> Editar</Link>
          <button type="button" onClick={handleDelete} className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"><Trash2 size={16} /> Eliminar</button>
        </div>
      </div>
    </article>
  );
};

export default NoticeCard;
