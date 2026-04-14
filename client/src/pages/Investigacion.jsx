import { motion } from 'framer-motion';

import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import Duran from '../assets/a-duran.webp';
import { fadeIn } from '../variants';

const Investigacion = () => {
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
            Investigación institucional
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-[2.9rem] xl:text-[3.1rem]">
            Unidad de Investigación de la Facultad de Ingeniería
          </h1>
        </motion.div>

        <motion.article
          variants={fadeIn('up', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_55px_rgba(15,23,42,0.08)]"
        >
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative bg-slate-100">
              <img
                src={Duran}
                alt="Dra. Amanda Duran Carhuamaca"
                className="h-[300px] w-full object-cover object-top sm:h-[360px] lg:h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
            </div>

            <div className="flex flex-col justify-center px-5 py-7 sm:px-8 lg:px-9 lg:py-8">
              <div className="mb-5 inline-flex w-fit items-center rounded-full bg-sky-50 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary">
                Directora (e) de la Unidad de Investigación
              </div>

              <h2 className="text-[1.9rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.25rem]">
                Dra. Amanda Duran Carhuamaca
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Profesional orientada al logro de objetivos con base en el uso estratégico de la tecnología. Magíster en
                Informática por la Pontificia Universidad Católica del Perú, Ingeniera de Sistemas, candidata a Doctora en
                Ingeniería de Sistemas y con formación doctoral en Docencia Universitaria.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Cuenta con experiencia en gestión y dirección de proyectos en distintas organizaciones, además de una sólida
                trayectoria como analista funcional de proyectos de software y docente universitaria con más de 13 años de
                experiencia.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Ha ejercido la dirección de la EAP de Ingeniería de Sistemas, desarrollado labor docente-investigadora en
                múltiples universidades y participado como expositora en temas de vanguardia relacionados con investigación
                y tecnología.
              </p>
            </div>
          </div>
        </motion.article>
      </section>

      <section className="mx-auto mt-16 max-w-screen-2xl px-4 md:px-14">
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8 xl:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
              Enfoque Académico
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Investigación Orientada a Innovación y Transferencia
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              La Unidad de Investigación de la Facultad de Ingeniería impulsa iniciativas que fortalecen la producción
              científica, la formación investigativa y la articulación entre academia, tecnología y entorno social.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Su trabajo busca generar proyectos con impacto real, promoviendo el análisis riguroso, la innovación aplicada
              y la participación activa de docentes y estudiantes en procesos de investigación pertinentes y sostenibles.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
              Líneas de Acción
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Prioridades de la Unidad
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <span>Fomento de la investigación científica y tecnológica.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <span>Participación docente y estudiantil en proyectos de impacto.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <span>Difusión de resultados y fortalecimiento de la cultura investigativa.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sección de decretos de investigación oculta temporalmente */}

      <Footer />
    </>
  );
};

export default Investigacion;
