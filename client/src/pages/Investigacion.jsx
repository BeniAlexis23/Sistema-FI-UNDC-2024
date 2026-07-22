import { motion } from 'framer-motion';

import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import Ferreyros from '../assets/j-ferreyros.webp';
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
                src={Ferreyros}
                alt="Dr. Jair Emerson Ferreyros Yucra"
                className="h-[300px] w-full object-cover object-top sm:h-[360px] lg:h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
            </div>

            <div className="flex flex-col justify-center px-5 py-7 sm:px-8 lg:px-9 lg:py-8">
              <div className="mb-5 inline-flex w-fit items-center rounded-full bg-sky-50 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary">
                Director (e) de la Unidad de Investigación
              </div>

              <h2 className="text-[1.9rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.25rem]">
                Dr. Jair Emerson Ferreyros Yucra
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Doctor en Ingeniería de sistemas, Magister Scientiae en Informática, Ingeniero de sistemas, Licenciado en matemáticas, estudios concluidos en segunda Especialidad Profesional que se centra en la investigación, didáctica y Docencia en educación superior, así como estudios concluidos en un Doctorado en Administración. Mis habilidades abarcan el análisis de sistemas y la gestión de proyectos en el ámbito de la tecnología de la información (TI).
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Destaco por mi capacidad para resolver problemas técnicos que surgen en el entorno laboral, además de contar con una sólida comunicación con el personal de la organización y los usuarios finales. Esta combinación de conocimientos y habilidades me permite abordar de manera efectiva los desafíos que se presentan en el campo de la tecnología y la educación.
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

      <Footer />
    </>
  );
};

export default Investigacion;
