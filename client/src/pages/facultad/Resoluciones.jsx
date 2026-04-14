import { useEffect, useMemo, useState } from 'react';
import { FaFileDownload } from 'react-icons/fa';
import { motion } from 'framer-motion';

import Navbar from '../../components/Navbar';
import Footer from '../../shared/Footer';
import { getResolucionesRequest } from '../../api/rcfs';
import { fadeIn } from '../../variants';

const yearOptions = ['2026', '2025', '2024', '2023'];

const Resoluciones = () => {
  const [resoluciones, setResoluciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [error, setError] = useState(null);

  const filteredResoluciones = useMemo(() => {
    return resoluciones.filter((rcf) => {
      const rcfYear = new Date(rcf.date).getFullYear().toString();

      return (
        (rcf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rcf.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedYear === '' || rcfYear === selectedYear)
      );
    });
  }, [resoluciones, searchTerm, selectedYear]);

  useEffect(() => {
    const getResoluciones = async () => {
      try {
        const res = await getResolucionesRequest();
        setResoluciones(res.data);
      } catch (fetchError) {
        setError('Error al cargar las resoluciones. Por favor, inténtalo de nuevo más tarde.');
        console.log(fetchError);
      }
    };

    getResoluciones();
  }, []);

  return (
    <>
      <Navbar />

      <section className="mx-auto mt-24 max-w-screen-2xl px-4 md:px-14">
        <motion.div
          variants={fadeIn('right', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
            Gestión documental
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl xl:text-[3.2rem]">
            Resoluciones de Coordinación de Facultad
          </h1>
        </motion.div>

        <motion.div
          variants={fadeIn('up', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_55px_rgba(15,23,42,0.08)]"
        >
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="lg:pl-2">
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Consulta de resoluciones
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Busca por título o contenido y filtra por año para encontrar la resolución que necesitas.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-slate-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar resolución..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="ml-3 w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:w-64"
                  />
                </div>

                <select
                  className="rounded-2xl border border-slate-200 bg-white px-2 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-sky-300"
                  onChange={(event) => setSelectedYear(event.target.value)}
                  value={selectedYear}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      Año {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 sm:px-8">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] sm:px-8">
                    N°
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] sm:px-8">
                    Resolución
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] sm:px-8">
                    Contenido
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] sm:px-8">
                    Descarga
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredResoluciones.length > 0 ? (
                  filteredResoluciones.map((rcf, index) => (
                    <tr key={rcf._id} className="border-b border-slate-200 transition hover:bg-sky-50/40">
                      <td className="px-5 py-5 align-top text-sm font-semibold text-slate-700 sm:px-8">
                        {index + 1}
                      </td>
                      <td className="px-5 py-5 align-top sm:px-8">
                        <p className="min-w-[180px] text-sm font-semibold leading-6 text-slate-900 sm:text-base">
                          {rcf.title}
                        </p>
                      </td>
                      <td className="px-5 py-5 align-top sm:px-8">
                        <p className="min-w-[260px] text-sm leading-7 text-slate-600">
                          {rcf.description}
                        </p>
                      </td>
                      <td className="px-5 py-5 align-top text-center sm:px-8">
                        <a
                          href={rcf.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-primary transition hover:scale-105 hover:bg-primary hover:text-white"
                          aria-label={`Descargar ${rcf.title}`}
                        >
                          <FaFileDownload className="text-xl" />
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-10 text-center text-sm text-slate-500 sm:px-8">
                      No se encontraron resoluciones con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      <Footer />
    </>
  );
};

export default Resoluciones;
