import { Clock } from 'lucide-react';
import NoticeContent from '../NoticeContent';
import { readingMinutesForBlocks } from '../readingTime';
import { toPreviewBlocks } from './noticeForm';
import { assetUrl } from '../../utils/assetUrl';
import { formatLimaDateTime, formatLongDate } from '../../utils/noticeDate';

/* Vista previa de la noticia con los mismos componentes que usa el portal */
const NoticePreview = ({ form, categoryName }) => {
  const blocks = toPreviewBlocks(form.blocks);
  const scheduled = form.mode === 'scheduled' && form.publishAtLocal;
  const dateLabel = scheduled
    ? `Se publicará el ${formatLimaDateTime(new Date(`${form.publishAtLocal}:00-05:00`).toISOString())}`
    : formatLongDate(form.displayDate ? `${form.displayDate}T00:00:00Z` : null);

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-4 sm:p-8">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-500 sm:text-base">
          <span className={scheduled ? '' : 'capitalize'}>{dateLabel}</span>
          {categoryName && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">{categoryName}</span>}
          <span className="inline-flex items-center gap-1"><Clock size={15} aria-hidden="true" /> {readingMinutesForBlocks(blocks)} min de lectura</span>
          {form.byline.trim() && <span>{form.byline.trim()}</span>}
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">{form.title.trim() || 'Título de la noticia'}</h2>
      </div>

      {form.coverUrl && (
        <div className="mt-8 overflow-hidden rounded-[1.5rem] bg-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <img src={assetUrl(form.coverUrl)} alt={form.imageAlt || form.title} className="h-auto w-full object-cover" />
        </div>
      )}

      <article className="mt-10">
        {blocks.length > 0
          ? <NoticeContent notice={{ content: blocks }} />
          : <p className="text-center text-sm text-slate-400">Aún no hay contenido para mostrar.</p>}
      </article>
    </div>
  );
};

export default NoticePreview;
