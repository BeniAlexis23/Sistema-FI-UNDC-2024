import { motion } from 'framer-motion';

import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import Daga from '../assets/m-daga.webp';
import { fadeIn } from '../variants';

const Posgrado = () => {
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
            Formación Avanzada
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-[2.9rem] xl:text-[3.1rem]">
            Unidad de Posgrado de la Facultad de Ingeniería
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
                src={Daga}
                alt="Dra. Marisol Daga Chaca"
                className="h-[300px] w-full object-cover object-top sm:h-[360px] lg:h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
            </div>

            <div className="flex flex-col justify-center px-5 py-7 sm:px-8 lg:px-9 lg:py-8">
              <div className="mb-5 inline-flex w-fit items-center rounded-full bg-sky-50 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary">
                Responsable (e) de la Unidad de Posgrado
              </div>

              <h2 className="text-[1.9rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.25rem]">
                Dra. Marisol Daga Chaca
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Doctora en Ciencias de la Educación, Magíster en Gestión Empresarial, Ingeniera de Sistemas y Computación y Licenciada en Educación con especialidad en Computación e Informática. Cuenta con amplia experiencia como docente universitaria e investigadora, desempeñándose en la formación de profesionales en ingeniería de sistemas, investigación científica y gestión académica.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Su trayectoria reciente incluye estudios de Doctorado en Ingeniería de Sistemas, así como diplomados y programas de especialización en Gestión Educativa, Didáctica de la Educación Superior, Estadística Aplicada a la Investigación Científica, desarrollo de software con PHP Laravel, transformación digital, innovación, aprendizaje-servicio, modelamiento de datos y metodología de la investigación. Asimismo, ha participado activamente en congresos nacionales e internacionales relacionados con ingeniería de sistemas, tecnologías de la información e investigación científica.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Se desempeña además como investigadora y capacitadora, con publicaciones científicas en revistas y libros académicos, así como experiencia en la organización de eventos científicos y proyectos de investigación. Su labor integra la docencia universitaria, la investigación y la innovación tecnológica, contribuyendo al fortalecimiento de la calidad educativa, la producción científica y el desarrollo de competencias profesionales en el ámbito de la Ingeniería de Sistemas.
              </p>
            </div>
          </div>
        </motion.article>
      </section>

      <section className="mx-auto mb-20 mt-16 max-w-screen-2xl px-4 md:px-14">
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8 xl:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
              Visión Académica
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Posgrado Orientado a Especialización e Innovación
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              La Unidad de Posgrado de la Facultad de Ingeniería promueve una formación avanzada enfocada en la
              actualización profesional, la investigación aplicada y el fortalecimiento de capacidades para responder a
              los desafíos tecnológicos y de gestión del entorno actual.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Su propósito es consolidar espacios académicos de alto nivel que contribuyan al desarrollo de especialistas
              capaces de liderar procesos de transformación, innovación y mejora continua en los distintos campos de la
              ingeniería.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
              Ejes de Trabajo
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Prioridades del Posgrado
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <span>Fortalecimiento de la especialización profesional.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <span>Impulso a la investigación y a la innovación tecnológica.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <span>Articulación entre academia, gestión y necesidades del entorno.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Posgrado;
