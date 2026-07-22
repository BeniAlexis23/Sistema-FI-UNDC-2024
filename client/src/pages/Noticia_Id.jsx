import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es';
import { motion } from 'framer-motion';

import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import { getNoticiaRequest, getNoticiasRequest } from '../api/notices';
import { assetUrl } from '../utils/assetUrl';
import { fadeIn } from '../variants';

dayjs.extend(utc);
dayjs.locale('es');

const truncateText = (text = '', maxLength = 90) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

const Noticia_Id = () => {
  const [noticia, setNoticia] = useState(null);
  const [relatedNoticias, setRelatedNoticias] = useState([]);
  const params = useParams();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [noticiaRes, noticiasRes] = await Promise.all([
          getNoticiaRequest(params.id),
          getNoticiasRequest(),
        ]);

        setNoticia(noticiaRes.data);
        setRelatedNoticias(
          noticiasRes.data
            .filter((item) => item._id !== params.id)
            .slice()
            .reverse()
            .slice(0, 3)
        );
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [params.id]);

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
          <motion.div
            variants={fadeIn('right', 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-5"
          >
            <p className="text-sm font-semibold capitalize text-slate-500 sm:text-base">
              {noticia?.date ? dayjs(noticia.date).utc().format('dddd DD MMM, YYYY') : ''}
            </p>

            <h1 className="lg:text-4xl font-extrabold tracking-tight text-slate-900 text-2xl xl:text-[2.1rem]">
              {noticia?.title}
            </h1>
          </motion.div>

          <motion.div
            variants={fadeIn('up', 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-8 overflow-hidden rounded-[1.5rem] bg-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
          >
            {noticia?.imageUrl && (
              <img
                src={assetUrl(noticia.imageUrl)}
                alt={noticia?.title || 'Noticia'}
                className="h-auto w-full object-cover object-center"
              />
            )}
          </motion.div>

          <motion.article
            variants={fadeIn('up', 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-10 max-w-4xl"
          >
            <div className="space-y-6 text-base leading-8 text-slate-700 sm:text-[1.05rem] sm:leading-9">
              {noticia?.description}
            </div>
          </motion.article>

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
              {relatedNoticias.map((item) => (
                <article
                  key={item._id}
                  className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
                >
                  <div className="overflow-hidden bg-slate-100">
                    <img
                      src={assetUrl(item.imageUrl)}
                      alt={item.title}
                      className="h-[230px] w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="space-y-4 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {dayjs(item.date).utc().format('DD MMM, YYYY')}
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
