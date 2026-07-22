import { NavLink } from 'react-router-dom';
import { FileText, LayoutDashboard, Newspaper, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/notices', label: 'Noticias', icon: Newspaper },
  { to: '/rcfs', label: 'Resoluciones', icon: FileText },
];

const Sidebar = () => {
  const { user } = useAuth();
  const visibleLinks = user?.role === 'admin'
    ? [...links, { to: '/users', label: 'Usuarios', icon: Users }]
    : links;

  return (
    <aside className="border-b border-slate-200 bg-white px-4 py-3 lg:min-h-[calc(100vh-65px)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:py-7">
      <p className="mb-3 hidden px-3 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-slate-400 lg:block">Navegación</p>
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
        {visibleLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-primary text-white shadow-[0_8px_20px_rgba(16,129,234,0.22)]' : 'text-slate-600 hover:bg-sky-50 hover:text-primary'}`}>
            <Icon size={19} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
