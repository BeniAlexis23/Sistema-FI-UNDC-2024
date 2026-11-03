import { formatLimaDateTime } from '../../utils/noticeDate';

export const STATUS = {
  active: { label: 'Activa', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  inactive: { label: 'Apagada', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
  scheduled: { label: 'Programada', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  expired: { label: 'Vencida', className: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

export const describeSchedule = (slide) => [
  slide.startAt && `desde ${formatLimaDateTime(slide.startAt)}`,
  slide.endAt && `hasta ${formatLimaDateTime(slide.endAt)}`,
].filter(Boolean).join(' ');

export const describeLink = (slide) => {
  if (slide.notice) return `Botón a la noticia «${slide.notice.title ?? 'sin título'}»`;
  if (slide.ctaUrl) return `Botón a ${slide.ctaUrl}`;
  return '';
};
