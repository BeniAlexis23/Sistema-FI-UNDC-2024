import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineClipboardDocumentList, HiDocumentArrowDown } from 'react-icons/hi2';
import { MdCheckCircle } from 'react-icons/md';
import { GrDocumentUser } from 'react-icons/gr';
import { FaUserGraduate } from 'react-icons/fa6';

import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import Vicente from '../assets/w-vicente.webp';
import Programacion from '../assets/programacion.webp';
import { fadeIn } from '../variants';

const academicObjectives = [
  'Promover y desarrollar labores de investigación científica y tecnológica de carácter multidisciplinario con participación de docentes y estudiantes.',
  'Impulsar la participación estudiantil en actividades extracurriculares, círculos de estudios y proyectos interdisciplinarios vinculados a las tecnologías de información.',
  'Integrar a los estudiantes con graduados y empleadores exitosos para fortalecer su motivación y visión profesional.',
  'Propiciar la capacitación permanente del personal docente en temas relacionados con la ingeniería de sistemas.',
  'Responder a las necesidades cambiantes de las organizaciones mediante profesionales calificados en tecnologías de información.',
];

const conceptual = [
  'Conoce e integra ciencias básicas, ciencias de la computación y ciencias de la empresa para resolver problemas.',
  'Distingue y explica las diferentes fases en la solución de un problema.',
  'Comprende metodologías del enfoque sistémico y científico para formular propuestas de solución.',
];

const procedural = [
  'Aplica la teoría general de sistemas y el pensamiento sistémico en la solución de problemas organizacionales.',
  'Modela, simula, implementa y optimiza sistemas complejos con soporte de tecnologías de información y comunicación.',
  'Planifica, analiza, diseña y desarrolla sistemas de información y comunicación.',
  'Modela unidades de negocio y procesos organizacionales.',
  'Aplica ingeniería de información integrada e integra información organizacional.',
  'Diseña e implementa redes globales de comunicación de datos.',
  'Gestiona organizaciones empresariales con estrategias orientadas a ventajas competitivas sostenibles.',
];

const attitudinal = [
  'Mantiene una actitud proactiva hacia la investigación y la actualización tecnológica.',
  'Ejerce su labor con creatividad, responsabilidad y ética.',
  'Orienta su profesión al desarrollo regional y nacional con comprensión de la realidad social.',
  'Promueve iniciativas con proyección amplia y visión global.',
  'Fomenta la generación de empresas y la adopción de nuevas tecnologías.',
  'Impulsa cambios económicos, sociales, científicos y tecnológicos en favor del desarrollo humano.',
];

const resourceSections = [
  {
    title: 'Plan de estudios vigente',
    items: [
      {
        title: 'Plan de estudios 2024',
        href: 'https://drive.google.com/file/d/1ve1jDeKrh475vw2V3dyF3pU9BkzsWcSx/view?usp=sharing',
        icon: HiOutlineClipboardDocumentList,
      },
    ],
  },
  {
    title: 'Documentos de prácticas preprofesionales',
    items: [
      {
        title: 'Reglamento de PPP',
        href: 'https://drive.google.com/drive/folders/10no5Ew5dja2WeSYvEDC7FYmhFYy4NalP?usp=sharing',
        icon: GrDocumentUser,
      },
      {
        title: 'Formatos de PPP',
        href: 'https://drive.google.com/drive/folders/1s8yv6N1PvbwZBLpKKxeUWcKWSFWRB0r3?usp=sharing',
        icon: HiDocumentArrowDown,
      },
    ],
  },
  {
    title: 'Documentos de RSU',
    items: [
      {
        title: 'Reglamento de RSU',
        href: 'https://drive.google.com/file/d/1XN9mCYqLui66LLy34WULbCk9G9zHJVHv/view?usp=sharing',
        icon: GrDocumentUser,
      },
      {
        title: 'Formatos de RSU',
        href: 'https://portal.undc.edu.pe/proyeccionsocial/base-legal/',
        icon: HiDocumentArrowDown,
      },
    ],
  },
];

const CompetencyBlock = ({ eyebrow, title, items }) => (
  <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8">
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">{eyebrow}</p>
    <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h3>
    <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const ResourceSection = ({ title, items }) => (
  <div className="mt-12">
    <h4 className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
      <MdCheckCircle className="text-primary" />
      <span>{title}</span>
    </h4>

    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.title}
            to={item.href}
            target="_blank"
            className="group flex items-center gap-4 rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-sky-200 hover:bg-sky-50/40 hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)]"
          >
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-100 text-2xl text-primary transition duration-300 group-hover:from-primary group-hover:to-secondary group-hover:text-white">
              <Icon />
            </span>
            <span className="text-lg font-semibold leading-7 text-slate-900 transition duration-300 group-hover:text-primary">
              {item.title}
            </span>
          </Link>
        );
      })}
    </div>
  </div>
);

const Escuela = () => {
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
            Formación Profesional
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-[2.9rem] xl:text-[3.1rem]">
            Escuela Profesional de Ingeniería de Sistemas
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
                src={Vicente}
                alt="Dr. Wagner Enoc Vicente Ramos"
                className="h-[300px] w-full object-cover object-top sm:h-[360px] lg:h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
            </div>

            <div className="flex flex-col justify-center px-5 py-7 sm:px-8 lg:px-9 lg:py-8">
              <div className="mb-5 inline-flex w-fit items-center rounded-full bg-sky-50 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary">
                Director (e) de la Escuela Profesional
              </div>

              <h2 className="text-[1.9rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.25rem]">
                Dr. Wagner Enoc Vicente Ramos
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Docente investigador de la Universidad Nacional de Cañete, con más de 15 años de experiencia en
                pregrado y posgrado. Doctor en Sistemas de Ingeniería, Magíster en Gestión Educativa, Ingeniero de
                Sistemas y actual doctorando en Ciencias Económicas por la Universidad de Buenos Aires.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Ha desempeñado cargos como Director de Escuela de Ingeniería de Sistemas y Computación, Coordinador de
                Investigación, Coordinador de la Facultad de Ingeniería y Director de Escuela de Posgrado.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Es conferencista y par evaluador en congresos nacionales e internacionales, investigador RENACYT y
                miembro activo de IEEE Computer Society, con líneas de trabajo en ciencias de las organizaciones,
                transformación digital e inteligencia artificial.
              </p>
            </div>
          </div>
        </motion.article>
      </section>

      <section className="mx-auto mt-16 max-w-screen-2xl px-4 md:px-14">
        <div className="grid gap-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="overflow-hidden rounded-[1.5rem] bg-slate-100">
            <img
              src={Programacion}
              alt="Perfil del egresado en Ingeniería de Sistemas"
              className="h-[260px] w-full object-cover object-center sm:h-[340px] lg:h-[420px]"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
              Perfil Profesional
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">
              Perfil del Egresado en Ingeniería de Sistemas
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              La Escuela Profesional de Ingeniería de Sistemas promueve competencias específicas basadas en el
              desarrollo integral de la persona, fortaleciendo habilidades, conocimientos y capacidades para un
              adecuado desenvolvimiento profesional en el campo de la ingeniería de sistemas.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              El egresado se forma bajo un enfoque por competencias que fortalece el vínculo con el sector laboral y
              potencia el capital humano en un contexto de cambios constantes. Desarrolla capacidades en software,
              redes, TIC, ciencia de datos e inteligencia artificial, con la investigación como eje de innovación.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Esta formación busca consolidar profesionales sólidos, capaces de contribuir al crecimiento y desarrollo
              del sector tecnológico e informático en distintos niveles de intervención.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-screen-2xl px-4 md:px-14">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
            Lineamientos Formativos
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-[2.7rem] xl:text-[3rem]">
            Objetivos y Competencias
          </h2>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          <CompetencyBlock eyebrow="Base académica" title="Objetivos académicos" items={academicObjectives} />
          <CompetencyBlock eyebrow="Fundamentos" title="Conceptual" items={conceptual} />
          <CompetencyBlock eyebrow="Aplicación" title="Procedimental" items={procedural} />
          <CompetencyBlock eyebrow="Enfoque humano" title="Actitudinales" items={attitudinal} />
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-screen-2xl px-4 md:px-14">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
            Trayectoria académica
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Grados y títulos
          </h2>

          <ul className="mt-6 space-y-4 text-sm text-slate-600 sm:text-base">
            <li className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4">
              <FaUserGraduate className="mt-0.5 text-2xl text-primary" />
              <span>Grado académico: Bachiller en Ingeniería de Sistemas.</span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4">
              <FaUserGraduate className="mt-0.5 text-2xl text-primary" />
              <span>Título profesional: Ingeniero de Sistemas.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto mb-20 mt-16 max-w-screen-2xl px-4 md:px-14">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
            Recursos Académicos
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-[2.7rem] xl:text-[3rem]">
            Documentos y Accesos
          </h2>
        </div>

        {resourceSections.map((section) => (
          <ResourceSection key={section.title} title={section.title} items={section.items} />
        ))}
      </section>

      <Footer />
    </>
  );
};

export default Escuela;
