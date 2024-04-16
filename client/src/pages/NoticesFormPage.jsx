import { useForm } from 'react-hook-form';
import { useNotices } from '../context/NoticesContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';

import NavbarAdmin from "../components/NavbarAdmin";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc)

const NoticesFormPage = () => {

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { createNotice, getNotice, updateNotice, errors: noticesErrors, setErrors } = useNotices();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    async function loadNotice() {
      if (params.id) {
        const notice = await getNotice(params.id);
        setValue('title', notice.title)
        setValue('description', notice.description)
        setValue('imageUrl', notice.imageUrl)
        setValue("date", dayjs.utc(notice.date).format("YYYY-MM-DD"))
      }
    }
    loadNotice();
  }, [])

  const onSubmit = handleSubmit(async (data) => {
    const dataValid = {
      ...data,
      date: data.date ? dayjs.utc(data.date).format() : dayjs.utc().format(),
    };

    if (params.id) {
      updateNotice(params.id, dataValid);
      navigate('/notices');
    } else {
      let data = await createNotice(dataValid);
      console.log(data)
      if (data.status == 200) {
        navigate('/notices');
      }
      /*console.log(noticesErrors)
      if (!noticesErrors.length == 0) {
        console.log("dentro del if")
        setErrors([])
        navigate('/notices');
      }*/
    };
  });

  return (
    <>
      <NavbarAdmin />
      <div className='flex h-[calc(100vh-100px)] items-center justify-center'>
        <div className='bg-zinc-800 text-white max-w-md w-full p-10 rounded-md'>
          {
            noticesErrors.map((error, i) => (
              <div className='bg-red-500 p-2 text-white text-center my-2' key={i}>
                {error}
              </div>
            ))
          }
          <form onSubmit={onSubmit}>
            <label htmlFor="title">Titulo</label>
            <input type="text" placeholder="Titulo" {...register('title', { required: true })} className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2' autoFocus />
            {errors.title && <p className='text-red-500'>Titulo requerido</p>}
            <label htmlFor="description">Descripción</label>
            <textarea rows="3" placeholder="Descripción" {...register('description', { required: true })} className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'></textarea>
            {errors.description && <p className='text-red-500'>Descripcion requerida</p>}
            <label htmlFor="imageURL">URL de la Imagen</label>
            <input type="text" placeholder="URL" {...register('imageUrl', { required: true })} className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2' />
            {errors.imageUrl && <p className='text-red-500'>Url de imagen requerida</p>}
            <label htmlFor="date">Fecha</label>
            <input className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2' type="date" {...register('date')} />
            <button className="bg-indigo-500 px-4 py-1 rounded-sm">Guardar</button>
          </form>
        </div>
      </div>
    </>
  )
}

export default NoticesFormPage;