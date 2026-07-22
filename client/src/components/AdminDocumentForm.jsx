import { Link } from 'react-router-dom';

const fieldClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100';

const AdminDocumentForm = ({ onSubmit, register, errors, apiErrors, backTo, isEditing, typeLabel }) => (
  <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-8">
    {apiErrors.map((error) => <div key={error} className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>)}
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block text-sm font-semibold text-slate-700">Título<input type="text" placeholder={`Título del ${typeLabel}`} {...register('title', { required: true })} className={fieldClass} autoFocus />{errors.title && <span className="mt-1 block text-sm text-red-600">El título es obligatorio</span>}</label>
      <label className="block text-sm font-semibold text-slate-700">Descripción<textarea rows="5" placeholder="Describe brevemente el contenido del documento" {...register('description', { required: true })} className={`${fieldClass} resize-y`} />{errors.description && <span className="mt-1 block text-sm text-red-600">La descripción es obligatoria</span>}</label>
      <label className="block text-sm font-semibold text-slate-700">Enlace del documento<input type="url" placeholder="https://..." {...register('url', { required: true })} className={fieldClass} />{errors.url && <span className="mt-1 block text-sm text-red-600">Ingresa una URL válida</span>}</label>
      <label className="block text-sm font-semibold text-slate-700">Fecha<input type="date" {...register('date')} className={fieldClass} /></label>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><Link to={backTo} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</Link><button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,129,234,0.2)] transition hover:bg-secondary">{isEditing ? 'Guardar cambios' : `Crear ${typeLabel}`}</button></div>
    </form>
  </div>
);

export default AdminDocumentForm;
