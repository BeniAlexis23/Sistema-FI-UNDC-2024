import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ExternalLink, Eye, EyeOff, Pencil, Star, Tag, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNotices } from '../context/NoticesContext';
import CoverPlaceholder from './CoverPlaceholder';
import { assetUrl } from '../utils/assetUrl';
import { formatLimaDateTime, formatShortDate } from '../utils/noticeDate';

const truncateText = (text = '', maxLength) => text.length <= maxLength ? text : `${text.slice(0, maxLength)}…`;

const statusStyles = {
  published: { label: 'Publicada', className: 'bg-emerald-50 text-emerald-700' },
  scheduled: { label: 'Programada', className: 'bg-amber-50 text-amber-700' },
  hidden: { label: 'Oculta', className: 'bg-slate-100 text-slate-600' },
};

const iconButton = 'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50';

const NoticeCard = ({ notice, onChanged }) => {
  const { deleteNotice, updateVisibility } = useNotices();
  const [busy, setBusy] = useState(false);
  const status = statusStyles[notice.status] ?? statusStyles.published;
  const isHidden = notice.status === 'hidden';

  const handleDelete = async () => {
    const result = await Swal.fire({ title: '¿Eliminar noticia?', text: 'Esta acción no se puede revertir.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', confirmButtonColor: '#dc2626', cancelButtonText: 'Cancelar', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });
    if (!result.isConfirmed) return;
    try {
      await deleteNotice(notice._id);
      onChanged?.();
      Swal.fire({ title: 'Noticia eliminada', icon: 'success', confirmButtonColor: '#1081ea' });
    } catch {
      Swal.fire({ title: 'No se pudo eliminar', text: 'Inténtalo nuevamente.', icon: 'error', confirmButtonColor: '#1081ea' });
    }
  };

  const changeVisibility = async (changes, failureTitle) => {
    setBusy(true);
    try {
      await updateVisibility(notice._id, changes);
      onChanged?.();
    } catch {
      Swal.fire({ title: failureTitle, text: 'Inténtalo nuevamente.', icon: 'error', confirmButtonColor: '#1081ea' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`group flex flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_22px_50px_rgba(15,23,42,0.09)] ${isHidden ? 'opacity-80' : ''}`}>
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {notice.imageUrl
          ? <img src={assetUrl(notice.imageUrl)} alt={notice.imageAlt || notice.title} loading="lazy" className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${isHidden ? 'grayscale' : ''}`} />
          : <CoverPlaceholder className="h-full w-full" />}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${status.className}`}>{status.label}</span>
          {notice.featured && <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow-sm"><Star size={12} fill="currentColor" /> Destacada</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-2"><CalendarDays size={15} />{formatShortDate(notice.date)}</span>
          {notice.category && <span className="inline-flex items-center gap-1.5"><Tag size={14} />{notice.category.name}</span>}
        </div>
        {notice.status === 'scheduled' && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Se publicará el {formatLimaDateTime(notice.publishAt)} (hora de Lima)</p>}
        <h2 className="text-lg font-bold leading-snug text-slate-900">{truncateText(notice.title, 65)}</h2>
        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{truncateText(notice.description, 115)}</p>
        <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4">
          <Link to={`/notices/${notice._id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-50 px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-sky-100"><Pencil size={16} /> Editar</Link>
          <button type="button" disabled={busy} onClick={() => changeVisibility({ hidden: !isHidden }, isHidden ? 'No se pudo mostrar' : 'No se pudo ocultar')} title={isHidden ? 'Mostrar en el portal' : 'Ocultar del portal'} aria-label={isHidden ? 'Mostrar en el portal' : 'Ocultar del portal'} className={iconButton}>{isHidden ? <Eye size={17} /> : <EyeOff size={17} />}</button>
          <button type="button" disabled={busy} onClick={() => changeVisibility({ featured: !notice.featured }, 'No se pudo cambiar el destacado')} title={notice.featured ? 'Quitar destacada' : 'Destacar'} aria-label={notice.featured ? 'Quitar destacada' : 'Destacar'} aria-pressed={notice.featured} className={`${iconButton} ${notice.featured ? 'border-amber-300 bg-amber-50 text-amber-600' : ''}`}><Star size={17} fill={notice.featured ? 'currentColor' : 'none'} /></button>
          {notice.status === 'published' && <a href={`/#/noticias/${notice._id}`} target="_blank" rel="noreferrer" title="Ver en el portal" aria-label="Ver en el portal" className={iconButton}><ExternalLink size={17} /></a>}
          <button type="button" onClick={handleDelete} title="Eliminar" aria-label="Eliminar" className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-red-600 transition hover:bg-red-50"><Trash2 size={17} /></button>
        </div>
      </div>
    </article>
  );
};

export default NoticeCard;
