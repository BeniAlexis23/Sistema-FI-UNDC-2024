import { useCallback, useEffect, useState } from 'react';
import { KeyRound, UserPlus } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminLayout from '../components/AdminLayout';
import { createUserRequest, getUsersRequest, resetUserPasswordRequest, updateUserRequest } from '../api/users';
import { getApiErrors } from '../api/errors';

const initialForm = { username: '', email: '', password: '', role: 'editor' };
const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const loadUsers = useCallback(async () => { try { setUsers((await getUsersRequest()).data); } catch (error) { setErrors(getApiErrors(error, 'No se pudieron cargar los usuarios')); } }, []);
  useEffect(() => { loadUsers(); }, [loadUsers]);
  const createUser = async (event) => { event.preventDefault(); setSubmitting(true); setErrors([]); try { await createUserRequest(form); setForm(initialForm); await loadUsers(); await Swal.fire({ title: 'Usuario creado', text: 'Deberá cambiar la contraseña temporal al ingresar.', icon: 'success', confirmButtonColor: '#1081ea' }); } catch (error) { setErrors(getApiErrors(error, 'No se pudo crear el usuario')); } finally { setSubmitting(false); } };
  const updateUser = async (id, changes) => { setErrors([]); try { await updateUserRequest(id, changes); await loadUsers(); } catch (error) { setErrors(getApiErrors(error, 'No se pudo actualizar el usuario')); } };
  const resetPassword = async (id) => { const result = await Swal.fire({ title: 'Nueva contraseña temporal', input: 'password', inputAttributes: { minlength: '8', autocomplete: 'new-password' }, inputValidator: (value) => !value || value.length < 8 ? 'Debe contener al menos 8 caracteres' : undefined, showCancelButton: true, confirmButtonText: 'Restablecer', confirmButtonColor: '#1081ea', cancelButtonText: 'Cancelar', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true }); if (!result.isConfirmed) return; try { await resetUserPasswordRequest(id, result.value); await loadUsers(); await Swal.fire({ title: 'Contraseña restablecida', text: 'El usuario deberá cambiarla al ingresar.', icon: 'success', confirmButtonColor: '#1081ea' }); } catch (error) { setErrors(getApiErrors(error, 'No se pudo restablecer la contraseña')); } };

  return (
    <AdminLayout title="Usuarios" description="Crea cuentas, asigna permisos y controla el acceso al panel administrativo.">
      {errors.map((error) => <div key={error} className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>)}
      <section className="mb-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="mb-5 flex items-center gap-3"><span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-primary"><UserPlus size={21} /></span><div><h2 className="font-bold text-slate-900">Crear usuario</h2><p className="text-sm text-slate-500">La contraseña ingresada será temporal.</p></div></div>
        <form onSubmit={createUser} className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1.2fr_1fr_0.8fr_auto]">
          <input required minLength={2} maxLength={80} placeholder="Nombre completo" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} className={fieldClass} />
          <input required type="email" maxLength={160} placeholder="Correo institucional" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={fieldClass} />
          <input required type="password" minLength={8} maxLength={128} placeholder="Contraseña temporal" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className={fieldClass} />
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className={fieldClass}><option value="editor">Editor</option><option value="admin">Administrador</option></select>
          <button disabled={submitting} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:opacity-50">{submitting ? 'Creando…' : 'Crear usuario'}</button>
        </form>
      </section>
      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
        <div className="overflow-x-auto"><table className="min-w-full"><thead className="bg-slate-50 text-left text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500"><tr><th className="px-5 py-4">Usuario</th><th className="px-5 py-4">Rol</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Contraseña</th><th className="px-5 py-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((item) => <tr key={item._id} className="hover:bg-sky-50/40"><td className="px-5 py-4"><p className="text-sm font-semibold text-slate-900">{item.username}</p><p className="mt-1 text-xs text-slate-500">{item.email}</p></td><td className="px-5 py-4"><select value={item.role} onChange={(event) => updateUser(item._id, { role: event.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="editor">Editor</option><option value="admin">Administrador</option></select></td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{item.active ? 'Activo' : 'Inactivo'}</span></td><td className="px-5 py-4 text-sm text-slate-500">{item.passwordChangeRequired ? 'Cambio pendiente' : 'Actualizada'}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => updateUser(item._id, { active: !item.active })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{item.active ? 'Desactivar' : 'Activar'}</button><button type="button" onClick={() => resetPassword(item._id)} className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"><KeyRound size={16} /> Restablecer</button></div></td></tr>)}</tbody></table></div>
      </section>
    </AdminLayout>
  );
};

export default UsersPage;
