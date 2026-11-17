import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Globe, Newspaper } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import CoverPlaceholder from '../components/CoverPlaceholder';
import { getEventoRequest } from '../api/events';
import { assetUrl } from '../utils/assetUrl';
import { thumbUrl } from '../cms/media';
import { formatNoticeDate } from '../utils/noticeDate';
import { displayHost, editionTitle } from '../cms/events/eventFormat';
import { EventMeta, SeriesMark, StatusBadge, seriesColor } from '../cms/events/EventVisuals';

const ExternalButton = ({ href, children, variant = 'primary' }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={variant === 'primary'
      ? 'inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary'
      : 'inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary'}
  >
    {children} <ExternalLink size={15} aria-hidden="true" />
    <span className="sr-only">(se abre en una pestaña nueva)</span>
  </a>
);

const EditionCover = ({ edition, series, color, className = '' }) => (
  edition.portada ? (
    <img
      src={assetUrl(edition.portada)}
      alt={edition.portadaAlt || `Afiche de la ${editionTitle(edition, series)}`}
      className={`object-cover ${className}`}
    />
  ) : (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center text-white ${className}`}
      style={{ background: `linear-gradient(135deg, ${color}, #2eb5ff)` }}
    >
      <span className="text-center">
        <span className="block text-5xl font-black tracking-tight sm:text-6xl">{edition.numeral}</span>
        <span className="mt-1 block text-sm font-bold uppercase tracking-[0.3em] text-white/80">{series.sigla}</span>
      </span>
    </div>
  )
);

const NoticeCard = ({ notice }) => (
  <Link
    to={`/noticias/${notice.id}`}
    className="group grid min-w-0 grid-cols-[6rem_1fr] overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-primary/40 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
  >
    <div className="h-full min-h-[5.5rem] overflow-hidden bg-slate-100">
      {notice.imageUrl ? (
        <img src={assetUrl(thumbUrl(notice.imageUrl))} alt={notice.imageAlt || ''} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      ) : (
        <CoverPlaceholder className="h-full w-full" />
      )}
    </div>
    <div className="min-w-0 p-3">
      <p className="text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">{formatNoticeDate(notice.date)}</p>
      <p className="mt-1 line-clamp-3 break-words text-sm font-bold leading-snug text-slate-900 group-hover:text-primary">{notice.title}</p>
    </div>
  </Link>
);

const CurrentEdition = ({ edition, series, color }) => (
  <section aria-labelledby="current-edition" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
    <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <EditionCover edition={edition} series={series} color={color} className="aspect-[16/10] w-full lg:aspect-auto lg:h-full lg:min-h-[22rem]" />
      <div className="flex min-w-0 flex-col p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary ring-1 ring-inset ring-sky-100">Edición vigente</span>
          <StatusBadge estado={edition.estado} />
        </div>
        <h2 id="current-edition" className="mt-4 break-words text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
          {editionTitle(edition, series)}
        </h2>
        {edition.semestre && <p className="mt-2 text-sm font-semibold text-slate-500">Semestre {edition.semestre}</p>}
        <EventMeta edition={edition} className="mt-5" />
        {edition.resumen && <p className="mt-5 whitespace-pre-line break-words text-sm leading-7 text-slate-600">{edition.resumen}</p>}
        <div className="mt-auto flex flex-col gap-2.5 pt-7 sm:flex-row">
          <ExternalButton href={series.urlPermanente}>Ir al sitio del evento</ExternalButton>
          {edition.url && edition.url !== series.urlPermanente && (
            <ExternalButton href={edition.url} variant="outline">Sitio de esta edición</ExternalButton>
          )}
        </div>
      </div>
    </div>
  </section>
);

const TimelineItem = ({ edition, series, color, isCurrent }) => (
  <li className="relative pb-10 pl-10 last:pb-0 sm:pl-14">
    <span
      aria-hidden="true"
      className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white text-[0.6rem] font-black text-white shadow sm:h-9 sm:w-9 sm:text-[0.7rem]"
      style={{ background: isCurrent ? color : '#94a3b8' }}
    >
      {edition.numero}
    </span>
    <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid sm:grid-cols-[12rem_minmax(0,1fr)]">
        <EditionCover edition={edition} series={series} color={isCurrent ? color : '#64748b'} className="aspect-[16/9] w-full sm:aspect-auto sm:h-full sm:min-h-[9rem]" />
        <div className="min-w-0 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {edition.semestre && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{edition.semestre}</span>}
            {isCurrent && <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-inset ring-sky-100">Vigente</span>}
            <StatusBadge estado={edition.estado} />
          </div>
          <h3 className="mt-2 break-words text-lg font-bold leading-snug text-slate-900" style={{ color: isCurrent ? color : undefined }}>{editionTitle(edition, series)}</h3>
          <EventMeta edition={edition} className="mt-3" />
          {edition.resumen && <p className="mt-3 line-clamp-4 whitespace-pre-line break-words text-sm leading-6 text-slate-600">{edition.resumen}</p>}
          {edition.url && (
            <a href={edition.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex max-w-full items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <Globe size={15} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{displayHost(edition.url) || 'Sitio de la edición'}</span>
              <span className="sr-only">(sitio de la edición {edition.numeral}, se abre en una pestaña nueva)</span>
            </a>
          )}
        </div>
      </div>
      {edition.noticias?.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/70 p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            <Newspaper size={14} aria-hidden="true" /> Noticias de esta edición
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {edition.noticias.map((notice) => <NoticeCard key={notice.id} notice={notice} />)}
          </div>
        </div>
      )}
    </article>
  </li>
);

/* /eventos/:slug: edición vigente e historia de todas las ediciones de una serie */
const EventoSerie = () => {
  const { slug } = useParams();
  const [state, setState] = useState({ status: 'loading', series: null });

  const load = useCallback(async () => {
    setState({ status: 'loading', series: null });
    try {
      const { data } = await getEventoRequest(slug);
      setState({ status: 'ready', series: data });
    } catch (error) {
      setState({ status: error.response?.status === 404 || error.response?.status === 400 ? 'notfound' : 'error', series: null });
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const { status, series } = state;
  const color = series ? seriesColor(series) : '#1081ea';
  const current = series?.actual;

  return (
    <>
      <Navbar />

      <main className="overflow-x-hidden">
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-[#0b3a6b] to-primary px-4 pb-14 pt-32 text-white sm:px-6 sm:pt-36 lg:px-8">
          <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" aria-hidden="true" />
          <div className="mx-auto max-w-screen-xl">
            <Link to="/eventos" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-sky-100 ring-1 ring-white/15 transition hover:bg-white/20">
              <ArrowLeft size={15} aria-hidden="true" /> Todos los eventos
            </Link>

            {status === 'loading' && (
              <div className="mt-8 space-y-4" aria-hidden="true">
                <div className="h-6 w-32 animate-pulse rounded bg-white/20" />
                <div className="h-12 w-full max-w-2xl animate-pulse rounded bg-white/20" />
              </div>
            )}
            {status === 'ready' && (
              <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
                <SeriesMark series={series} color={color} size="lg" className="ring-4 ring-white/20" />
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-sky-200">{series.sigla}</p>
                  <h1 className="mt-2 break-words text-3xl font-extrabold tracking-tight sm:text-4xl xl:text-5xl">{series.nombre}</h1>
                  {series.descripcion && <p className="mt-4 max-w-3xl text-base leading-7 text-sky-50/90">{series.descripcion}</p>}
                  <p className="mt-4 text-sm text-sky-100/80">
                    {series.totalEdiciones === 1 ? '1 edición' : `${series.totalEdiciones} ediciones`}
                    {' · '}
                    <a href={series.urlPermanente} target="_blank" rel="noreferrer" className="font-semibold text-white underline-offset-4 hover:underline">
                      {displayHost(series.urlPermanente)}
                    </a>
                  </p>
                </div>
              </div>
            )}
            {(status === 'error' || status === 'notfound') && (
              <h1 className="mt-8 text-3xl font-extrabold tracking-tight sm:text-4xl">Eventos de la Facultad</h1>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          {status === 'loading' && (
            <div className="space-y-6" aria-hidden="true">
              <div className="h-80 animate-pulse rounded-3xl bg-slate-100" />
              <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          )}

          {status === 'notfound' && (
            <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
              <p className="text-lg font-bold text-slate-900">No encontramos este evento.</p>
              <p className="mt-2 text-slate-600">Puede que la dirección esté mal escrita o que el evento ya no se publique.</p>
              <Link to="/eventos" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary">Ver todos los eventos</Link>
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-slate-600">No pudimos cargar este evento en este momento.</p>
              <button type="button" onClick={load} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary">Reintentar</button>
            </div>
          )}

          {status === 'ready' && (
            <>
              {current && <CurrentEdition edition={current} series={series} color={color} />}

              <section aria-labelledby="history-heading" className="mt-14">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80">Historial</p>
                <h2 id="history-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Todas las ediciones</h2>

                {series.ediciones.length === 0 ? (
                  <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">Aún no hay ediciones publicadas.</p>
                ) : (
                  <ol className="relative mt-8 before:absolute before:bottom-2 before:left-[0.85rem] before:top-2 before:w-0.5 before:bg-slate-200 sm:before:left-[1.1rem]">
                    {series.ediciones.map((edition) => (
                      <TimelineItem key={edition.id} edition={edition} series={series} color={color} isCurrent={edition.id === current?.id} />
                    ))}
                  </ol>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default EventoSerie;
