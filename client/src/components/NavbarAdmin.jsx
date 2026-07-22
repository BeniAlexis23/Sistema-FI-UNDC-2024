import { Link } from 'react-router-dom';
import { ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoUndc from '../assets/es-undc.png';
import logoFi from '../assets/logo-fi.png';

const NavbarAdmin = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-4">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex min-w-0 items-center gap-3">
          <span className="flex items-center gap-1.5">
            <img src={logoUndc} alt="UNDC" className="h-9 w-9 object-contain" />
            <img src={logoFi} alt="Facultad de Ingeniería" className="h-9 w-9 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-950 sm:text-base">Administración FI</span>
            <span className="hidden text-xs text-slate-500 sm:block">Gestión de contenido institucional</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-800">{user.username}</p>
                <p className="text-xs text-slate-500">{user.role === 'admin' ? 'Administrador' : 'Editor'}</p>
              </div>
              <Link to="/" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-primary" title="Ver sitio público">
                <ExternalLink size={17} /><span className="hidden md:inline">Ver sitio</span>
              </Link>
              <button type="button" onClick={logout} className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-primary" title="Cerrar sesión">
                <LogOut size={17} /><span className="hidden md:inline">Salir</span>
              </button>
            </>
          ) : <Link to="/login" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Ingresar</Link>}
        </div>
      </div>
    </nav>
  );
};

export default NavbarAdmin;
