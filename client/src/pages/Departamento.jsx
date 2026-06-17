import { motion } from 'framer-motion';

import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';

import Oseda from '../assets/d-oseda.webp';
import Vicente from '../assets/w-vicente.webp';
import Almidon from '../assets/c-almidon.webp';
import Roque from '../assets/e-roque.webp';
import Duran from '../assets/a-duran.webp';
import Pacheco from '../assets/a-pacheco.webp';
import Angoma from '../assets/m-angoma.webp';
import Ferreyros from '../assets/j-ferreyros.webp';
import Larico from '../assets/g-larico.webp';
import Asto from '../assets/l-asto.webp';
import Aranguena from '../assets/m-aranguena.webp';
import Huancahuire from '../assets/c-huancahuire.webp';
import Cardenas from '../assets/c-cardenas.webp';
import Daga from '../assets/m-daga.webp';
import Hernandez from '../assets/j-hernandez.webp';
import Reynoso from '../assets/j-reynoso.webp';
import Vilca from '../assets/j-vilca.webp';
import { fadeIn } from '../variants';

const docentes = [
  { id: 1, nombre: 'Ph.D. Dulio Oseda Gago', condicion: 'Docente Principal', foto: Oseda },
  { id: 2, nombre: 'Dr. Guido Larico Uchamaco', condicion: 'Docente Principal', foto: Larico },
  { id: 3, nombre: 'Dr. Wagner Vicente Ramos', condicion: 'Docente Principal', foto: Vicente },
  { id: 4, nombre: 'Dr. Carlos Almidon Ortiz', condicion: 'Docente Principal', foto: Almidon },
  { id: 5, nombre: 'Ph.D. Edwin Roque Tito', condicion: 'Docente Principal', foto: Roque },
  { id: 6, nombre: 'Dra. Amanda Durán Carhuamaca', condicion: 'Docente Asociado', foto: Duran },
  { id: 7, nombre: 'Dra. Marisol Daga Chaca', condicion: 'Docente Asociado', foto: Daga },
  { id: 8, nombre: 'Mg. Alex Pacheco Pumaleque', condicion: 'Docente Asociado', foto: Pacheco },
  { id: 9, nombre: 'Dra. Miriam Angoma Astucuri', condicion: 'Docente Auxiliar', foto: Angoma },
  { id: 10, nombre: 'Dr. Jair Ferreyros Yucra', condicion: 'Docente Auxiliar', foto: Ferreyros },
  { id: 11, nombre: 'M.Sc. Leonidas Asto Huamán', condicion: 'Docente Auxiliar', foto: Asto },
  { id: 12, nombre: 'M.Sc. Magaly Arangüena Yllanes', condicion: 'Docente Auxiliar', foto: Aranguena },
  { id: 13, nombre: 'M.Sc. Claudio Huancahuire Bravo', condicion: 'Docente Auxiliar', foto: Huancahuire },
  { id: 14, nombre: 'Mg. Juan Hernández Péves', condicion: 'Docente Auxiliar', foto: Hernandez },
  { id: 15, nombre: 'Mg. Cesar Cárdenas Lino', condicion: 'Docente Auxiliar', foto: Cardenas },
  { id: 16, nombre: 'Mg. Joel Vilca Pizarro', condicion: 'Docente Auxiliar', foto: Vilca },
  { id: 17, nombre: 'MBA Jenny Reynoso Palpa', condicion: 'Docente Auxiliar', foto: Reynoso },
];

const Departamento = () => {
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
            Dirección Académica
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-[2.9rem] xl:text-[3.1rem]">
            Departamento Académico de Ingeniería de Sistemas
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
                src={Roque}
                alt="Ph.D. Edwin Roque Tito"
                className="h-[300px] w-full object-cover object-top sm:h-[360px] lg:h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
            </div>

            <div className="flex flex-col justify-center px-5 py-7 sm:px-8 lg:px-9 lg:py-8">
              <div className="mb-5 inline-flex w-fit items-center rounded-full bg-sky-50 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary">
                Responsable (e) del Departamento Académico
              </div>

              <h2 className="text-[1.9rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.25rem]">
                Ph.D. Edwin Roque Tito
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Docente universitario de pre y posgrado, con experiencia en proyectos de desarrollo de software,
                implementación de sistemas de información en todas sus etapas, administración de bases de datos y
                sistemas operativos, orientados al logro de objetivos y metas organizacionales.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Ingeniero de Sistemas de profesión, Magister Scientiae en Informática por la Universidad Nacional del
                Altiplano y Doctor en Ingeniería de Sistemas por la Universidad Nacional Federico Villarreal. Cuenta
                además con formación en Integración e Innovación de TI en la PUCP y especialización en formulación y
                evaluación de proyectos de inversión.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Su objetivo profesional se centra en aportar experiencia en el área de ingeniería de sistemas y
                telecomunicaciones, fortaleciendo el trabajo académico y continuando con un desarrollo constante dentro
                del entorno universitario.
              </p>
            </div>
          </div>
        </motion.article>
      </section>

      <section className="mx-auto mb-20 mt-16 max-w-screen-2xl px-4 md:px-14">
        <motion.div
          variants={fadeIn('right', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
            Plana Docente
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-[2.7rem] xl:text-[3rem]">
            Docentes Ordinarios
          </h2>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {docentes.map((docente, index) => (
            <motion.article
              key={docente.id}
              variants={fadeIn('up', 0.08 * ((index % 4) + 1))}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-2 hover:border-sky-200 hover:shadow-[0_26px_60px_rgba(15,23,42,0.12)]"
            >
              <div className="relative h-72 overflow-hidden bg-slate-100">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/18 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                <img
                  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.05]"
                  src={docente.foto}
                  alt={docente.nombre}
                />
              </div>

              <div className="space-y-3 p-6 transition duration-300 group-hover:bg-sky-50/40">
                <p className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary">
                  {docente.condicion}
                </p>
                <h3 className="text-xl font-bold leading-snug text-slate-900 transition duration-300 group-hover:text-primary">
                  {docente.nombre}
                </h3>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Departamento;
