import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaAngleDown, FaBars, FaXmark } from 'react-icons/fa6';

import logoUndc from '../assets/es-undc.png';
import logoFi from '../assets/logo-fi.png';

const facultyItems = [
  { label: 'Nosotros', to: '/facultad' },
  { label: 'Resoluciones', to: '/facultad/resoluciones' },
];

const schoolItems = [
  { label: 'Ingeniería de Sistemas', to: '/escuela' },
  { label: 'Tutoría', to: 'https://tutoria.undc.edu.pe/Login/index.php', external: true },
  { label: 'RSU', to: 'https://portal.undc.edu.pe/proyeccionsocial/', external: true },
];

const eventItems = [
  { label: 'VII CIISIC', to: 'https://ciisic-vii.episundc.pe/', external: true },
  { label: 'V JEPA', to: 'https://jepa.episundc.pe/', external: true },
  { label: 'IV FEINFO', to: 'https://uifi.episundc.pe/', external: true },
];

const mainLinks = [
  { label: 'Departamento', to: '/departamento' },
  { label: 'Investigación', to: '/investigacion' },
  { label: 'Posgrado', to: '/posgrado' },
];

const mobileGroups = [
  { key: 'facultad', label: 'Facultad', items: facultyItems },
  { key: 'escuela', label: 'Escuelas', items: schoolItems },
  { key: 'eventos', label: 'Eventos', items: eventItems },
];

const renderNavItem = (item, className = '') => {
  if (item.external) {
    return (
      <a
        href={item.to}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.to} className={className}>
      {item.label}
    </Link>
  );
};

const DesktopDropdown = ({ label, items, isOpen, onToggle }) => (
  <div className="relative">
    <button
      type="button"
      onClick={onToggle}
      className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        isOpen
          ? 'bg-sky-100 text-primary shadow-sm'
          : 'text-slate-700 hover:bg-slate-100 hover:text-primary'
      }`}
    >
      <span>{label}</span>
      <FaAngleDown
        className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>

    {isOpen && (
      <div className="absolute left-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_20px_50px_rgba(15,23,42,0.16)] backdrop-blur">
        {items.map((item) => (
          <div key={`${label}-${item.label}`}>
            {renderNavItem(
              item,
              'block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-primary'
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const MobileDropdown = ({ label, items, isOpen, onToggle, onNavigate }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/70">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between px-4 py-4 text-left text-base font-semibold text-slate-800"
    >
      <span>{label}</span>
      <FaAngleDown
        className={`text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>

    {isOpen && (
      <div className="space-y-2 border-t border-slate-200 px-3 py-3">
        {items.map((item) => (
          <div key={`${label}-${item.label}`}>
            {item.external ? (
              <a
                href={item.to}
                target="_blank"
                rel="noreferrer"
                onClick={onNavigate}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-primary"
              >
                {item.label}
              </a>
            ) : (
              <Link
                to={item.to}
                onClick={onNavigate}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-primary"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);

  const toggleDesktopDropdown = (key) => {
    setOpenDesktopDropdown((current) => (current === key ? null : key));
  };

  const toggleMobileDropdown = (key) => {
    setOpenMobileDropdown((current) => (current === key ? null : key));
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setOpenDesktopDropdown(null);
    setOpenMobileDropdown(null);
  };

  useEffect(() => {
    closeAllMenus();
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-[10001] border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3 rounded-2xl pr-2 transition hover:bg-slate-100/80 sm:pr-4"
          >
            <div className="flex items-center gap-2">
              <img src={logoUndc} alt="Logo UNDC" className="h-10 w-10 object-contain sm:h-11 sm:w-11" />
              <img src={logoFi} alt="Logo Facultad de Ingeniería" className="h-10 w-10 object-contain sm:h-11 sm:w-11" />
            </div>
            <div className="min-w-0 self-center">
              <p className="truncate text-lg font-bold tracking-wide text-slate-900 sm:text-xl">
                FI - UNDC
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-1 xl:gap-2">
            <DesktopDropdown
              label="Facultad"
              items={facultyItems}
              isOpen={openDesktopDropdown === 'facultad'}
              onToggle={() => toggleDesktopDropdown('facultad')}
            />

            {mainLinks.slice(0, 1).map((item) => (
              <div key={item.label}>
                {renderNavItem(
                  item,
                  'inline-flex rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-primary'
                )}
              </div>
            ))}

            <DesktopDropdown
              label="Escuelas"
              items={schoolItems}
              isOpen={openDesktopDropdown === 'escuela'}
              onToggle={() => toggleDesktopDropdown('escuela')}
            />

            {mainLinks.slice(1).map((item) => (
              <div key={item.label}>
                {renderNavItem(
                  item,
                  'inline-flex rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-primary'
                )}
              </div>
            ))}

            <DesktopDropdown
              label="Eventos"
              items={eventItems}
              isOpen={openDesktopDropdown === 'eventos'}
              onToggle={() => toggleDesktopDropdown('eventos')}
            />
          </div>

          <div className="hidden items-center gap-6 xl:gap-8 lg:flex">
            <div className="hidden xl:block">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
                Portal institucional
              </p>
              <p className="text-sm font-semibold text-slate-700">
                Información académica y oficial
              </p>
            </div>

            <Link
              to="/contacto"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-secondary"
            >
              Contacto
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-sky-200 hover:text-primary lg:hidden"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMenuOpen ? <FaXmark className="text-xl" /> : <FaBars className="text-lg" />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/30 backdrop-blur-[2px] lg:hidden">
          <div className="absolute inset-x-4 top-[88px] max-h-[calc(100vh-104px)] overflow-y-auto rounded-[2rem] border border-white/60 bg-white p-5 shadow-[0_28px_70px_rgba(15,23,42,0.22)] sm:inset-x-6">
            <div className="mb-5 rounded-[1.5rem] bg-gradient-to-r from-sky-50 via-white to-blue-50 p-4 ring-1 ring-sky-100">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                Navegación
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                Accesos rápidos del portal FI - UNDC
              </p>
            </div>

            <div className="space-y-3">
              {mobileGroups.map((group) => (
                <MobileDropdown
                  key={group.key}
                  label={group.label}
                  items={group.items}
                  isOpen={openMobileDropdown === group.key}
                  onToggle={() => toggleMobileDropdown(group.key)}
                  onNavigate={closeAllMenus}
                />
              ))}

              {mainLinks.map((item) => (
                <div key={item.label}>
                  {item.external ? (
                    <a
                      href={item.to}
                      target="_blank"
                      rel="noreferrer"
                      onClick={closeAllMenus}
                      className="block rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-base font-semibold text-slate-800 transition hover:bg-white hover:text-primary"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.to}
                      onClick={closeAllMenus}
                      className="block rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-base font-semibold text-slate-800 transition hover:bg-white hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              <Link
                to="/contacto"
                onClick={closeAllMenus}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-4 text-base font-semibold text-white"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
