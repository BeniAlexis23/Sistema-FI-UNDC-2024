import { FaAddressBook, FaGraduationCap } from 'react-icons/fa';
import { SiGoogleclassroom } from 'react-icons/si';
import { ImBooks } from 'react-icons/im';
import { AiOutlineDeliveredProcedure } from 'react-icons/ai';
import { GrLanguage } from 'react-icons/gr';

const systems = [
  {
    label: 'SIVIRENO',
    href: 'https://sivireno.undc.edu.pe/',
    icon: FaAddressBook,
  },
  {
    label: 'Aula virtual',
    href: 'https://aula.undc.edu.pe/',
    icon: SiGoogleclassroom,
  },
  {
    label: 'Biblioteca',
    href: 'https://vri.undc.edu.pe/biblioteca/',
    icon: ImBooks,
  },
  {
    label: 'Repositorio UNDC',
    href: 'https://repositorio.undc.edu.pe/',
    icon: FaGraduationCap,
  },
  {
    label: 'Trámite documentario',
    href: 'https://tramite.undc.edu.pe/',
    icon: AiOutlineDeliveredProcedure,
  },
  {
    label: 'GEDIPI',
    href: 'https://vri.undc.edu.pe/gedipi/',
    icon: GrLanguage,
  },
];

const SInformacion = () => {
  return (
    <section className="mx-auto mb-24 max-w-screen-2xl px-4 md:px-14">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
          Accesos institucionales
        </p>
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl xl:text-[3.35rem]">
          Sistemas de información
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {systems.map((system) => {
          const Icon = system.icon;

          return (
            <a
              key={system.label}
              href={system.href}
              target="_blank"
              rel="noreferrer"
              className="group flex min-h-[76px] items-center gap-4 rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 text-slate-800 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-sky-200 hover:bg-sky-50/50 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-100 text-primary transition duration-300 group-hover:scale-105 group-hover:from-primary group-hover:to-secondary group-hover:text-white">
                <Icon className="text-xl" />
              </span>

              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-800 transition duration-300 group-hover:text-primary sm:text-base">
                {system.label}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default SInformacion;
