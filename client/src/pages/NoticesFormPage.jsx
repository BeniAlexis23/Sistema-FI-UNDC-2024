import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Swal from 'sweetalert2';
import AdminLayout from '../components/AdminLayout';
import { useNotices } from '../context/NoticesContext';

dayjs.extend(utc);
const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100';

const NoticesFormPage = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { createNotice, getNotice, updateNotice, errors: apiErrors } = useNotices();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    getNotice(id).then((notice) => {
      setValue('title', notice.title); setValue('description', notice.description); setValue('date', dayjs.utc(notice.date).format('YYYY-MM-DD'));
    });
  }, [getNotice, id, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    const confirmation = await Swal.fire({ title: id ? '¿Actualizar noticia?' : '¿Publicar noticia?', icon: 'question', showCancelButton: true, confirmButtonText: id ? 'Actualizar' : 'Publicar', confirmButtonColor: '#1081ea', cancelButtonText: 'Cancelar', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });
    if (!confirmation.isConfirmed) return;
    const formData = new FormData();
    formData.append('title', data.title); formData.append('description', data.description); formData.append('date', data.date ? dayjs.utc(data.date).format() : dayjs.utc().format());
    if (data.imageUrl?.length) formData.append('imageUrl', data.imageUrl[0]);
    const response = id ? await updateNotice(id, formData) : await createNotice(formData);
    if (response?.status === 200) { await Swal.fire({ title: id ? 'Noticia actualizada' : 'Noticia publicada', icon: 'success', confirmButtonColor: '#1081ea' }); navigate('/notices'); }
  });

  return (
    <AdminLayout title={id ? 'Editar noticia' : 'Nueva noticia'} description="Completa la información que se mostrará en el portal institucional.">
      <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-8">
        {apiErrors.map((error) => <div key={error} className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>)}
        <form onSubmit={onSubmit} className="space-y-5">
          <label className="block text-sm font-semibold text-slate-700">Título<input type="text" placeholder="Título de la publicación" {...register('title', { required: true })} className={inputClass} autoFocus />{errors.title && <span className="mt-1 block text-sm text-red-600">El título es obligatorio</span>}</label>
          <label className="block text-sm font-semibold text-slate-700">Descripción<textarea rows="5" placeholder="Resumen de la noticia" {...register('description', { required: true })} className={`${inputClass} resize-y`} />{errors.description && <span className="mt-1 block text-sm text-red-600">La descripción es obligatoria</span>}</label>
          <label className="block text-sm font-semibold text-slate-700">Imagen destacada<input type="file" accept="image/jpeg,image/png,image/webp" {...register('imageUrl')} className="mt-2 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-100 file:px-3 file:py-2 file:font-semibold file:text-primary" /><span className="mt-2 block text-xs font-normal text-slate-500">JPG, PNG o WebP. Si estás editando, déjalo vacío para conservar la imagen actual.</span></label>
          <label className="block text-sm font-semibold text-slate-700">Fecha de publicación<input type="date" {...register('date')} className={inputClass} /></label>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><Link to="/notices" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</Link><button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,129,234,0.2)] transition hover:bg-secondary">{id ? 'Guardar cambios' : 'Publicar noticia'}</button></div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NoticesFormPage;
