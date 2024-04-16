import { useForm } from 'react-hook-form';
import { useRcfs } from '../context/RcfsContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';

import NavbarAdmin from "../components/NavbarAdmin";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc)

const RcfsFormPage = () => {

    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const { createRcf, getRcf, updateRcf, errors: rcfsErrors, setErrors } = useRcfs();
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        async function loadRcf() {
            if (params.id) {
                const rcf = await getRcf(params.id);
                setValue('title', rcf.title)
                setValue('description', rcf.description)
                setValue('url', rcf.url)
                setValue("date", dayjs.utc(rcf.date).format("YYYY-MM-DD"))
            }
        }
        loadRcf();
    }, [])

    const onSubmit = handleSubmit(async (data) => {
        const dataValid = {
            ...data,
            date: data.date ? dayjs.utc(data.date).format() : dayjs.utc().format(),
        };

        if (params.id) {
            updateRcf(params.id, dataValid);
            navigate('/rcfs');
        } else {
            let data = await createRcf(dataValid);
            console.log(data)
            if (data.status == 200) {
                navigate('/rcfs');
            }
        };
    });

    return (
        <>
            <NavbarAdmin />
            <div className='flex h-[calc(100vh-100px)] items-center justify-center'>
                <div className='bg-zinc-800 text-white max-w-md w-full p-10 rounded-md'>
                    {
                        rcfsErrors.map((error, i) => (
                            <div className='bg-red-500 p-2 text-white text-center my-2' key={i}>
                                {error}
                            </div>
                        ))
                    }
                    <form onSubmit={onSubmit}>
                        <label for="title">Titulo</label>
                        <input type="text" placeholder="Titulo" {...register('title', { required: true })} className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2' autoFocus />
                        {errors.title && <p className='text-red-500'>Titulo requerido</p>}
                        <label for="description">Descripción</label>
                        <textarea rows="3" placeholder="Descripción" {...register('description', { required: true })} className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2'></textarea>
                        {errors.description && <p className='text-red-500'>Descripcion requerida</p>}
                        <label htmlFor="url">URL de la RCF</label>
                        <input type="text" placeholder="URL" {...register('url', { required: true })} className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2' />
                        {errors.url && <p className='text-red-500'>Url requerida</p>}
                        <label for="date">Fecha</label>
                        <input className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2' type="date" {...register('date')} />
                        <button className="bg-indigo-500 px-4 py-1 rounded-sm">Guardar</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default RcfsFormPage;