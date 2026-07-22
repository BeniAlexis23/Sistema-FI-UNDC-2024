import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Swal from 'sweetalert2';
import AdminLayout from '../components/AdminLayout';
import AdminDocumentForm from '../components/AdminDocumentForm';
import { useRcfs } from '../context/RcfsContext';

dayjs.extend(utc);

const RcfsFormPage = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { createRcf, getRcf, updateRcf, errors: apiErrors } = useRcfs();
  const navigate = useNavigate();
  const { id } = useParams();
  useEffect(() => { if (id) getRcf(id).then((item) => { setValue('title', item.title); setValue('description', item.description); setValue('url', item.url); setValue('date', dayjs.utc(item.date).format('YYYY-MM-DD')); }); }, [getRcf, id, setValue]);
  const onSubmit = handleSubmit(async (data) => {
    const result = await Swal.fire({ title: id ? '¿Actualizar resolución?' : '¿Crear resolución?', icon: 'question', showCancelButton: true, confirmButtonText: id ? 'Actualizar' : 'Crear', confirmButtonColor: '#1081ea', cancelButtonText: 'Cancelar', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });
    if (!result.isConfirmed) return;
    const payload = { ...data, date: data.date ? dayjs.utc(data.date).format() : dayjs.utc().format() };
    const response = id ? await updateRcf(id, payload) : await createRcf(payload);
    if (response?.status === 200) { await Swal.fire({ title: id ? 'Resolución actualizada' : 'Resolución creada', icon: 'success', confirmButtonColor: '#1081ea' }); navigate('/rcfs'); }
  });
  return <AdminLayout title={id ? 'Editar resolución' : 'Nueva resolución'} description="Registra los datos y el enlace público del documento."><AdminDocumentForm onSubmit={onSubmit} register={register} errors={errors} apiErrors={apiErrors} backTo="/rcfs" isEditing={Boolean(id)} typeLabel="resolución" /></AdminLayout>;
};

export default RcfsFormPage;
