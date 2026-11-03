import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import CoverPlaceholder from '../components/CoverPlaceholder';
import NoticeContent from '../cms/NoticeContent';
import ShareButton from '../cms/ShareButton';
import { getNoticiaRequest, getNoticiasRequest } from '../api/notices';
import { assetUrl } from '../utils/assetUrl';
import { formatLongDate, formatNoticeDate } from '../utils/noticeDate';
import { fadeIn } from '../variants';

const RELATED_COUNT = 3;

const truncateText = (text = '', maxLength = 90) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/* Primero de la misma categoría y, si faltan, las más recientes */
const loadRelated = async (noticia) => {
  const sameCategory = noticia.category
    ? (await getNoticiasRequest({ limit: RELATED_COUNT + 1, category: noticia.category.slug })).data
    : [];
  const related = sameCategory.filter((item) => item._id !== noticia._id);
  if (related.length >= RELATED_COUNT) return related.slice(0, RELATED_COUNT);

  const latest = (await getNoticiasRequest({ limit: RELATED_COUNT + 1 })).data;
  const extra = latest.filter((item) => item._id !== noticia._id && !related.some((other) => other._id === item._id));
  return [...related, ...extra].slice(0, RELATED_COUNT);
};

const shareButtonClass = 'inline-flex items-center rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:border-primary hover:text-primary';

const Noticia_Id = () => {
  const [state, setState] = useState({ status: 'loading', noticia: null, related: [] });
  const params = useParams();
  const { status, noticia, related } = state;

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setState({ status: 'loading', noticia: null, related: [] });
      try {
        const { data } = await getNoticiaRequest(params.id);
        if (cancelled) return;
        setState({ status: 'ready', noticia: data, related: [] });

        const relatedNoticias = await loadRelated(data).catch(() => []);
        if (!cancelled) setState((current) => ({ ...current, related: relatedNoticias }));
      } catch (error) {
        if (!cancelled) {
          setState({ status: error.response?.status === 404 ? 'notFound' : 'error', noticia: null, related: [] });
        }
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [params.id]);

  useEffect(() => {
    if (!noticia) return undefined;
    const previousTitle = document.title;
    document.title = `${noticia.title} | FI - UNDC`;
    return () => { document.title = previousTitle; };
  }, [noticia]);

  return (
    <>
      <Navbar />

      <section className="relative isolate overflow-hidden bg-white px-6 pt-28 lg:px-0">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <svg
            className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="news-detail-grid"
                width="200"
                height="200"
                x="50%"
                y="-1"
                patternUnits="userSpaceOnUse"
              >
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y="-1" className="overflow-visible fill-gray-50">
              <path d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z" strokeWidth="0" />
            </svg>
            <rect width="100%" height="100%" strokeWidth="0" fill="url(#news-detail-grid)" />
          </svg>
        </div>

        <div className="mx-auto max-w-5xl px-2 sm:px-6">
          {status === 'loading' && (
            <div className="space-y-6 py-4" aria-busy="true" aria-label="Cargando noticia">
              <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-72 w-full animate-pulse rounded-[1.5rem] bg-slate-100" />
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-4 w-full animate-pulse rounded bg-slate-100" />)}
              </div>
            </div>
          )}

          {(status === 'notFound' || status === 'error') && (
            <div className="mx-auto max-w-xl py-16 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {status === 'notFound' ? 'Esta noticia no está disponible' : 'No pudimos cargar la noticia'}
              </h1>
              <p className="mt-4 text-slate-600">
                {status === 'notFound'
                  ? 'Es posible que haya sido retirada o que el enlace no sea correcto.'
                  : 'Inténtalo nuevamente en unos minutos.'}
              </p>
              <Link
                to="/noticias"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-secondary"
              >
                Ver todas las noticias
              </Link>
            </div>
          )}

          {status === 'ready' && noticia && (
            <>
              <motion.div
                variants={fadeIn('right', 0.2)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="space-y-5"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-500 sm:text-base">
                  <span className="capitalize">{formatLongDate(noticia.date)}</span>
                  {noticia.category && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                      {noticia.category.name}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock size={15} aria-hidden="true" /> {noticia.readingMinutes} min de lectura
                  </span>
                  {noticia.byline && <span>{noticia.byline}</span>}
                </div>

                <h1 className="lg:text-4xl font-extrabold tracking-tight text-slate-900 text-2xl xl:text-[2.1rem]">
                  {noticia.title}
                </h1>

                <ShareButton notice={noticia} className={shareButtonClass} />
              </motion.div>

              {noticia.imageUrl && (
                <motion.div
                  variants={fadeIn('up', 0.2)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.15 }}
                  className="mt-8 overflow-hidden rounded-[1.5rem] bg-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
                >
                  <img
                    src={assetUrl(noticia.imageUrl)}
                    alt={noticia.imageAlt || noticia.title || 'Noticia'}
                    className="h-auto w-full object-cover object-center"
                  />
                </motion.div>
              )}

              <article className="mt-10">
                <NoticeContent notice={noticia} />
              </article>

              <div className="mt-12 flex justify-center border-t border-slate-100 pt-8">
                <ShareButton notice={noticia} label="Compartir esta noticia" className={shareButtonClass} />
              </div>
            </>
          )}

          <section className="mt-16 border-t border-slate-200 pt-10">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
                Sigue explorando
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                También te puede interesar
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {related.map((item) => (
                <article
                  key={item._id}
                  className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
                >
                  <div className="overflow-hidden bg-slate-100">
                    {item.imageUrl ? (
                      <img
                        src={assetUrl(item.imageUrl)}
                        alt={item.imageAlt || item.title}
                        loading="lazy"
                        className="h-[230px] w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <CoverPlaceholder className="h-[230px] w-full" />
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {formatNoticeDate(item.date)}
                    </p>

                    <h3 className="text-2xl font-extrabold leading-tight text-slate-900">
                      {truncateText(item.title, 78)}
                    </h3>

                    <Link
                      to={`/noticias/${item._id}`}
                      className="inline-flex items-center text-lg font-semibold text-primary transition hover:text-secondary"
                    >
                      Leer
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8">
              <Link
                to="/noticias"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-secondary"
              >
                Volver a noticias
              </Link>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Noticia_Id;
