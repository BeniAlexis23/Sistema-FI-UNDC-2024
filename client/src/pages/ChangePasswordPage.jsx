import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChangePasswordPage = () => {
  const { changePassword, errors, user } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ currentPassword: '', newPassword: '' });
  if (!user?.passwordChangeRequired) return <Navigate to="/dashboard" replace />;
  const handleSubmit = async (event) => { event.preventDefault(); if (await changePassword(values)) navigate('/dashboard', { replace: true }); };
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 p-5">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.09)] sm:p-9">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-primary"><ShieldCheck size={28} /></span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">Protege tu cuenta</h1><p className="mt-2 text-sm leading-6 text-slate-500">Debes reemplazar la contraseña temporal antes de acceder al panel.</p>
        <div className="mt-5">{errors.map((error) => <p key={error} className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>)}</div>
        <div className="mt-6 space-y-5">
          <label className="block text-sm font-semibold text-slate-700">Contraseña actual<div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100"><KeyRound size={18} className="text-slate-400" /><input type="password" required minLength={6} autoComplete="current-password" value={values.currentPassword} onChange={(event) => setValues({ ...values, currentPassword: event.target.value })} className="w-full bg-transparent py-3 outline-none" /></div></label>
          <label className="block text-sm font-semibold text-slate-700">Nueva contraseña<div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100"><KeyRound size={18} className="text-slate-400" /><input type="password" required minLength={8} autoComplete="new-password" value={values.newPassword} onChange={(event) => setValues({ ...values, newPassword: event.target.value })} className="w-full bg-transparent py-3 outline-none" /></div><span className="mt-2 block text-xs font-normal text-slate-500">Usa al menos 8 caracteres y evita datos fáciles de adivinar.</span></label>
        </div>
        <button type="submit" className="mt-7 w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-white shadow-[0_12px_28px_rgba(16,129,234,0.24)] transition hover:bg-secondary">Guardar y continuar</button>
      </form>
    </main>
  );
};

export default ChangePasswordPage;
