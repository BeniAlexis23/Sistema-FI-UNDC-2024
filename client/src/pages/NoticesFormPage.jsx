import { useForm } from 'react-hook-form';
import { useNotices } from '../context/NoticesContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import NavbarAdmin from "../components/NavbarAdmin";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const NoticesFormPage = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { createNotice, getNotice, updateNotice, errors: noticesErrors, setErrors } = useNotices();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    async function loadNotice() {
      if (params.id) {
        const notice = await getNotice(params.id);
        setValue('title', notice.title);
        setValue('description', notice.description);
        setValue("date", dayjs.utc(notice.date).format("YYYY-MM-DD"));
      }
    }
    loadNotice();
  }, [params.id, getNotice, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('date', data.date ? dayjs.utc(data.date).format() : dayjs.utc().format());

    if (data.imageUrl && data.imageUrl.length > 0) {
      formData.append('imageUrl', data.imageUrl[0]); // 'imageUrl' es ahora un archivo
    }

    if (params.id) {
      await updateNotice(params.id, formData);
      navigate('/notices');
    } else {
      const response = await createNotice(formData);
      if (response && response.status === 200) {
        navigate('/notices');
      }
    }
  });

  return (
    <>
      <NavbarAdmin />
      <div className='flex h-[calc(100vh-100px)] items-center justify-center'>
        <div className='bg-zinc-800 text-white max-w-md w-full p-10 rounded-md'>
          {noticesErrors.map((error, i) => (
            <div className='bg-red-500 p-2 text-white text-center my-2' key={i}>
              {error}
            </div>
          ))}
          <form onSubmit={onSubmit}>
            <label htmlFor="title">Título</label>
            <input
              type="text"
              placeholder="Título"
              {...register('title', { required: true })}
              className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
              autoFocus
            />
            {errors.title && <p className='text-red-500'>Título requerido</p>}

            <label htmlFor="description">Descripción</label>
            <textarea
              rows="3"
              placeholder="Descripción"
              {...register('description', { required: true })}
              className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
            ></textarea>
            {errors.description && <p className='text-red-500'>Descripción requerida</p>}

            <label htmlFor="imageUrl">Imagen</label>
            <input
              type="file"
              {...register('imageUrl')}
              className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
            />

            <label htmlFor="date">Fecha</label>
            <input
              type="date"
              className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'
              {...register('date')}
            />

            <button className="bg-indigo-500 px-4 py-1 rounded-sm">Guardar</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default NoticesFormPage;