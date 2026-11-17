import { CalendarDays, MapPin } from 'lucide-react';
import { assetUrl } from '../../utils/assetUrl';
import { formatEventDates, statusInfo } from './eventFormat';

const PALETTE = ['#1081ea', '#0e7490', '#4f46e5', '#0f766e', '#2563eb'];

/* Color de la serie: el elegido en el panel o uno de la paleta institucional según su posición */
export const seriesColor = (series, index = 0) => series?.color || PALETTE[index % PALETTE.length];

/* Logo de la serie o, si no tiene, un monograma con su sigla sobre su color */
export const SeriesMark = ({ series, color, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-12 w-12 rounded-xl text-[0.65rem]',
    md: 'h-16 w-16 rounded-2xl text-xs',
    lg: 'h-20 w-20 rounded-2xl text-sm sm:h-24 sm:w-24',
  };
  if (series.logo) {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden bg-white p-1.5 shadow-sm ring-1 ring-slate-200 ${sizes[size]} ${className}`}>
        <img src={assetUrl(series.logo)} alt={series.logoAlt || `Logo de ${series.sigla}`} className="h-full w-full object-contain" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center font-black tracking-wider text-white shadow-sm ${sizes[size]} ${className}`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
    >
      {series.sigla}
    </span>
  );
};

export const StatusBadge = ({ estado, className = '' }) => {
  const status = statusInfo(estado);
  if (!status) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.className} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
      {status.label}
    </span>
  );
};

/* Fechas (hora de Lima) y sede de una edición */
export const EventMeta = ({ edition, className = '' }) => {
  const dates = formatEventDates(edition?.fechaInicio, edition?.fechaFin);
  if (!dates && !edition?.sede) return null;
  return (
    <dl className={`space-y-1.5 text-sm text-slate-600 ${className}`}>
      {dates && (
        <div className="flex items-start gap-2">
          <dt className="sr-only">Fecha</dt>
          <CalendarDays size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <dd className="min-w-0">
            <time dateTime={edition.fechaInicio}>{dates}</time>
          </dd>
        </div>
      )}
      {edition.sede && (
        <div className="flex items-start gap-2">
          <dt className="sr-only">Sede</dt>
          <MapPin size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <dd className="min-w-0 break-words">{edition.sede}</dd>
        </div>
      )}
    </dl>
  );
};
