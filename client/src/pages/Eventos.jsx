import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, History } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import { useEventSeries } from '../cms/events/useEventSeries';
import { editionTitle } from '../cms/events/eventFormat';
import { EventMeta, SeriesMark, StatusBadge, seriesColor } from '../cms/events/EventVisuals';

const CardSkeleton = () => (
  <div className="h-[24rem] animate-pulse rounded-3xl bg-slate-100" aria-hidden="true" />
);

const SeriesCard = ({ series, index, offline }) => {
  const color = seriesColor(series, index);
  const current = series.actual;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className="relative h-2" style={{ background: `linear-gradient(90deg, ${color}, #2eb5ff)` }} aria-hidden="true" />
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <SeriesMark series={series} color={color} />
          {current && <StatusBadge estado={current.estado} />}
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em]" style={{ color }}>{series.sigla}</p>
        <h2 className="mt-2 text-xl font-extrabold leading-snug text-slate-950 sm:text-[1.4rem]">{series.nombre}</h2>
        {series.descripcion && <p className="mt-3 text-sm leading-6 text-slate-600">{series.descripcion}</p>}

        <div className="mt-6 flex-1 rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-100">
          {current ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Edición vigente</p>
              <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-base font-bold text-slate-900">
                <span className="text-2xl font-black" style={{ color }}>{current.numeral}</span>
                <span>edición</span>
              </p>
              {current.titulo && <p className="mt-1 break-words text-sm font-semibold text-slate-700">{editionTitle(current, series)}</p>}
              {current.semestre && <p className="mt-1 text-xs font-semibold text-slate-500">Semestre {current.semestre}</p>}
              <EventMeta edition={current} className="mt-3" />
            </>
          ) : (
            <p className="text-sm text-slate-500">Próximamente se anunciará la nueva edición.</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <a
            href={series.urlPermanente}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
          >
            Ir al sitio <ExternalLink size={15} aria-hidden="true" />
            <span className="sr-only">de {series.sigla} (se abre en una pestaña nueva)</span>
          </a>
          {!offline && (
            <Link
              to={`/eventos/${series.slug}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
            >
              <History size={15} aria-hidden="true" /> Ver ediciones
              <span className="sr-only">de {series.sigla}</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

/* /eventos: una tarjeta por serie con su edición vigente */
const Eventos = () => {
  const { source, series } = useEventSeries();
  const offline = source === 'fallback';

  return (
    <>
      <Navbar />

      <main className="overflow-x-hidden">
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-[#0b3a6b] to-primary px-4 pb-16 pt-32 text-white sm:px-6 sm:pb-20 sm:pt-36 lg:px-8">
          <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-32 left-10 -z-10 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" aria-hidden="true" />
          <div className="mx-auto max-w-screen-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-200 sm:text-sm">Facultad de Ingeniería</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-[3.4rem]">Eventos de la Facultad</h1>
            <div className="mt-5 h-1.5 w-24 rounded-full bg-secondary" />
            <p className="mt-6 max-w-3xl text-base leading-7 text-sky-50/90 sm:text-lg">
              Congresos, jornadas y ferias que organizamos cada año para compartir la investigación, los proyectos
              y el talento de nuestra comunidad. Cada evento tiene un sitio permanente con su edición vigente y
              aquí puedes revisar la historia de todas sus ediciones.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="series-heading">
          <h2 id="series-heading" className="sr-only">Series de eventos</h2>

          {source === 'loading' && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} />)}
            </div>
          )}

          {offline && (
            <p role="status" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              No pudimos cargar el detalle de los eventos en este momento. Aquí tienes los enlaces a sus sitios.
            </p>
          )}

          {source !== 'loading' && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {series.map((item, index) => (
                <SeriesCard key={item.slug} series={item} index={index} offline={offline} />
              ))}
            </div>
          )}

          <p className="mt-10 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-slate-500">
            ¿Buscas las noticias de un evento?
            <Link to="/noticias" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
              Ver noticias <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Eventos;
