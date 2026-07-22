import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import banner2 from '../assets/banner2.webp';
import logoUndc from '../assets/es-undc.png';
import logoFi from '../assets/logo-fi.png';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { signin, errors: signinErrors, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (isAuthenticated) navigate(user?.passwordChangeRequired ? '/change-password' : '/dashboard', { replace: true }); }, [isAuthenticated, navigate, user?.passwordChangeRequired]);

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden lg:block"><img src={banner2} alt="Facultad de Ingeniería" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-slate-950/10" /><div className="absolute inset-x-0 bottom-0 p-12 text-white xl:p-16"><p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200">Facultad de Ingeniería</p><h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight xl:text-5xl">Gestión institucional en un solo lugar</h1><p className="mt-4 max-w-lg leading-7 text-slate-200">Administra noticias y documentos publicados en el portal de la facultad.</p></div></section>
      <section className="flex min-h-screen items-center justify-center p-5 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"><ArrowLeft size={17} /> Volver al portal</Link>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.09)] sm:p-9">
            <div className="mb-7 flex items-center gap-3"><img src={logoUndc} alt="UNDC" className="h-11 w-11 object-contain" /><img src={logoFi} alt="Facultad de Ingeniería" className="h-11 w-11 object-contain" /><div className="ml-1"><p className="font-bold text-slate-950">Administración FI</p><p className="text-xs text-slate-500">Acceso autorizado</p></div></div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Bienvenido</h2><p className="mt-2 text-sm leading-6 text-slate-500">Ingresa con tu cuenta institucional para continuar.</p>
            <div className="mt-5">{signinErrors.map((error) => <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" key={error}>{error}</div>)}</div>
            <form onSubmit={handleSubmit(signin)} className="mt-6 space-y-5">
              <label className="block text-sm font-semibold text-slate-700">Correo electrónico<div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-sky-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100"><Mail size={18} className="text-slate-400" /><input type="email" autoComplete="username" placeholder="usuario@undc.edu.pe" {...register('email', { required: true })} className="w-full bg-transparent py-3 outline-none" /></div>{errors.email && <span className="mt-1 block text-sm text-red-600">El correo es obligatorio</span>}</label>
              <label className="block text-sm font-semibold text-slate-700">Contraseña<div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-sky-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100"><LockKeyhole size={18} className="text-slate-400" /><input type="password" autoComplete="current-password" placeholder="••••••••" {...register('password', { required: true })} className="w-full bg-transparent py-3 outline-none" /></div>{errors.password && <span className="mt-1 block text-sm text-red-600">La contraseña es obligatoria</span>}</label>
              <button disabled={isSubmitting} className="w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-white shadow-[0_12px_28px_rgba(16,129,234,0.24)] transition hover:bg-secondary disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Ingresando…' : 'Ingresar al panel'}</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
