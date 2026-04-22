import { Link } from 'react-router-dom';
import { FaFacebookSquare, FaInstagramSquare, FaLinkedin } from 'react-icons/fa';

import logoUndc from '../assets/es-undc.png';
import logoFi from '../assets/logo-fi.png';

const quickLinks = [
  { label: 'Facultad', to: '/facultad' },
  { label: 'Departamento', to: '/departamento' },
  { label: 'Escuela', to: '/escuela' },
  { label: 'Noticias', to: '/noticias' },
];

const externalLinks = [
  { label: 'Portal UNDC', href: 'https://portal.undc.edu.pe/' },
  { label: 'Centro de Idiomas', href: 'https://www.undc.edu.pe/idiomas/' },
  { label: 'Posgrado UNDC', href: 'https://posgrado.undc.edu.pe/' },
  { label: 'Admisión', href: 'https://admision.undc.edu.pe/' },
];

const socialLinks = [
  { icon: FaFacebookSquare, href: 'https://www.facebook.com/FIUNDC', label: 'Facebook' },
  { icon: FaInstagramSquare, href: 'https://www.instagram.com/', label: 'Instagram' },
  { icon: FaLinkedin, href: 'https://www.linkedin.com/', label: 'LinkedIn' },
];

const certifications = [
  { standard: 'ISO', code: '21001:2018', color: 'text-sky-400', ring: 'border-sky-500/45' },
  { standard: 'ISO', code: '9001:2015', color: 'text-blue-400', ring: 'border-blue-500/45' },
  { standard: 'ISO', code: '14001:2015', color: 'text-emerald-400', ring: 'border-emerald-500/45' },
  { standard: 'ISO', code: '45001:2018', color: 'text-amber-400', ring: 'border-amber-500/45' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-screen-2xl">
        <div className="grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr] lg:gap-10 lg:px-10">
          <div className="max-w-md">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={logoUndc} alt="Logo UNDC" className="h-10 w-10 object-contain" />
              <img src={logoFi} alt="Logo FI" className="h-10 w-10 object-contain" />
              <span className="text-lg font-bold tracking-wide text-white">FI - UNDC</span>
            </Link>

            <p className="mt-4 text-[0.82rem] leading-5 text-slate-300">
              Portal institucional de la Facultad de Ingeniería para difundir información académica,
              noticias, resoluciones y servicios de la Escuela Profesional de Ingeniería de Sistemas.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {certifications.map((item) => (
                <span
                  key={item.code}
                  className={`inline-flex h-9 w-9 flex-col items-center justify-center rounded-full border ${item.ring} bg-slate-950/35 text-center shadow-sm`}
                  title={`${item.standard} ${item.code}`}
                >
                  <span className={`text-[0.65rem] font-black leading-none ${item.color}`}>
                    {item.standard}
                  </span>
                  <span className={`mt-0.5 text-[0.38rem] font-bold leading-none ${item.color}`}>
                    {item.code}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
              Navegación
            </h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
              Plataformas
            </h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              {externalLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
              Contacto
            </h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              <p>Horario: 8:00 AM - 1:00 PM / 2:00 PM - 5:00 PM</p>
              <p>Lunes a viernes</p>
              <p>+51 949026908</p>
              <p>Av. Mariscal Benavides N° 322, San Vicente - Cañete</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Facultad de Ingeniería UNDC © {currentYear}. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-sky-300/60 hover:bg-sky-400/10 hover:text-white"
                  >
                    <Icon className="text-lg" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
