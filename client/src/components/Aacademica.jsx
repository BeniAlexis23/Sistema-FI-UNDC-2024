import { motion } from 'framer-motion';

import academica1 from '../assets/a-academica1.webp';
import academica2 from '../assets/a-academica2.webp';
import academica3 from '../assets/a-academica3.webp';
import academica4 from '../assets/a-academica4.webp';
import { fadeIn } from '../variants';

const activities = [
  {
    title: 'Taller de Tesis',
    image: academica1,
    description: 'Espacios orientados al acompañamiento metodológico y al fortalecimiento del proceso de investigación.',
  },
  {
    title: 'Exposición de Productos Académicos',
    image: academica2,
    description: 'Presentación de proyectos y resultados que reflejan el trabajo académico desarrollado por los estudiantes.',
  },
  {
    title: 'Ferias de Investigación Formativa',
    image: academica3,
    description: 'Encuentros que impulsan la creatividad, la experimentación y la cultura investigativa en la facultad.',
  },
  {
    title: 'Pausas Activas',
    image: academica4,
    description: 'Actividades que promueven el bienestar integral y una experiencia universitaria más saludable y dinámica.',
  },
];

const Aacademica = () => {
  return (
    <section className="mx-auto mb-20 max-w-screen-2xl px-4 md:px-14" id="Aacademica">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
          Vida universitaria
        </p>
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl xl:text-[3.35rem]">
          Actividades académicas
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {activities.map((activity, index) => (
          <motion.article
            key={activity.title}
            variants={fadeIn('up', 0.12 * (index + 1))}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-2 hover:border-sky-200 hover:shadow-[0_28px_60px_rgba(15,23,42,0.12)]"
          >
            <div className="relative h-56 overflow-hidden bg-slate-100 sm:h-60">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/18 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              <img
                src={activity.image}
                alt={activity.title}
                className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.06]"
              />
            </div>

            <div className="space-y-4 p-6 transition duration-300 group-hover:bg-sky-50/40">
              <h3 className="text-2xl font-bold leading-snug text-slate-900 transition duration-300 group-hover:text-primary">
                {activity.title}
              </h3>
              <p className="text-sm leading-7 text-slate-600 sm:text-base">
                {activity.description}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default Aacademica;
