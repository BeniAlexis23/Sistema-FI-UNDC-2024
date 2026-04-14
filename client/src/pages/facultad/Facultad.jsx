import { motion } from 'framer-motion';

import Navbar from '../../components/Navbar';
import Footer from '../../shared/Footer';
import Banner from '../../shared/Banner';
import Oseda from '../../assets/d-oseda.webp';
import banner1 from '../../assets/banner1.webp';
import { fadeIn } from '../../variants';

const Facultad = () => {
  return (
    <>
      <Navbar />

      <section className="mx-auto mt-24 max-w-screen-2xl px-4 md:px-14" id="home">
        <Banner
          banner={banner1}
          eyebrow="Presentación institucional"
          heading="UNDC - Facultad de Ingeniería"
          subheading="La Facultad de Ingeniería de la UNDC es un espacio de formación orientado a la excelencia académica, la investigación y la innovación. Promovemos una educación sólida y actualizada que prepara profesionales capaces de responder a los retos del entorno tecnológico y contribuir activamente al desarrollo de la sociedad."
        />
      </section>

      <section className="mx-auto mb-20 mt-14 max-w-screen-2xl px-4 md:px-14">
        <motion.div
          variants={fadeIn('right', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
            Autoridad académica
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-[2.9rem] xl:text-[3.1rem]">
            Coordinación de la Facultad de Ingeniería
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
                src={Oseda}
                alt="Ph.D. Dulio Oseda Gago"
                className="h-[300px] w-full object-cover object-top sm:h-[360px] lg:h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
            </div>

            <div className="flex flex-col justify-center px-5 py-7 sm:px-8 lg:px-9 lg:py-8">
              <div className="mb-5 inline-flex w-fit items-center rounded-full bg-sky-50 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary">
                Coordinador (e) de la Facultad de Ingeniería
              </div>

              <h2 className="text-[1.9rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.25rem]">
                Ph.D. Dulio Oseda Gago
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Docente universitario en la categoría de Principal, con más de 23 años de experiencia en investigación,
                gestión educacional y acreditación universitaria. Doctor en Ciencias de la Educación, Doctor en Psicología
                Educacional y Tutorial, Doctor en Educación, Doctor en Administración de la Educación, Doctor en Sistemas
                de Ingeniería, DBA in Business Administration, Ph.D. in Business Administration y Ph.D. in Scientific Research.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Cuenta además con formación posdoctoral en Ciencias de la Educación, Sistemas Diacrónicos y Sincrónicos de
                la Investigación Científica y Big Data. Ha liderado procesos de planificación estratégica, gestión de proyectos,
                organización de eventos científicos y publicaciones académicas en ámbitos nacionales e internacionales.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Su trayectoria incluye experiencia como Vicerrector Académico y Vicerrector de Investigación, así como labor
                docente en pregrado y posgrado. Actualmente se desempeña como docente investigador en la Universidad Nacional
                Mayor de San Marcos y en la Universidad Nacional de Cañete.
              </p>
            </div>
          </div>
        </motion.article>
      </section>

      <Footer />
    </>
  );
};

export default Facultad;
