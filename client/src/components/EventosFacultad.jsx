import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { useEventSeries } from '../cms/events/useEventSeries';
import { formatEventShortDate } from '../cms/events/eventFormat';
import { SeriesMark, StatusBadge, seriesColor } from '../cms/events/EventVisuals';

const MAX_SERIES = 3;

/* Franja de la portada: las series de eventos con su edición vigente y enlace a /eventos */
const EventosFacultad = () => {
  const { source, series } = useEventSeries();
  const visible = series.slice(0, MAX_SERIES);

  return (
    <section className="mx-auto mb-16 max-w-screen-2xl px-4 md:px-14" aria-labelledby="home-events-heading">
      <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-[#0b3a6b] to-primary p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-200 sm:text-sm">Agenda académica</p>
            <h2 id="home-events-heading" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Eventos de la Facultad</h2>
          </div>
          <Link to="/eventos" className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-sky-50">
            Ver todos los eventos <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {source === 'loading'
            ? Array.from({ length: MAX_SERIES }, (_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-2xl bg-white/10" aria-hidden="true" />
            ))
            : visible.map((item, index) => {
              const current = item.actual;
              const date = formatEventShortDate(current?.fechaInicio);
              return (
                <a
                  key={item.slug}
                  href={item.urlPermanente}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-w-0 items-start gap-4 rounded-2xl bg-white p-4 text-slate-900 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(2,6,23,0.35)]"
                >
                  <SeriesMark series={item} color={seriesColor(item, index)} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-extrabold">{[current?.numeral, item.sigla].filter(Boolean).join(' ')}</span>
                      {current && <StatusBadge estado={current.estado} className="!py-0.5" />}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm leading-snug text-slate-600">{item.nombre}</span>
                    {date && <span className="mt-2 block text-xs font-semibold text-slate-500">{date}{current?.sede ? ` · ${current.sede}` : ''}</span>}
                  </span>
                  <ExternalLink size={16} className="mt-1 shrink-0 text-slate-400 transition group-hover:text-primary" aria-hidden="true" />
                  <span className="sr-only">(se abre en una pestaña nueva)</span>
                </a>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default EventosFacultad;
