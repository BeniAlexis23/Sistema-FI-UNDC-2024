import NavbarAdmin from './NavbarAdmin';
import Sidebar from './Sidebar';

const AdminLayout = ({ children, title, description, action }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <NavbarAdmin />
    <div className="flex w-full flex-col lg:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {(title || action) && (
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-primary">Panel administrativo</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
              {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </header>
        )}
        {children}
      </main>
    </div>
  </div>
);

export default AdminLayout;
