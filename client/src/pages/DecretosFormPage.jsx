import { useForm } from 'react-hook-form';
import { useDecretos } from '../context/UI-DecretosContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavbarAdmin from "../components/NavbarAdmin";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import Swal from 'sweetalert2';

const DecretosFormPage = () => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const { createDecreto, getDecreto, updateDecreto, errors: decretosErrors, setErrors } = useDecretos();
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        async function loadDecreto() {
            if (params.id) {
                const decreto = await getDecreto(params.id);
                setValue('title', decreto.title)
                setValue('description', decreto.description)
                setValue('url', decreto.url)
                setValue("date", dayjs.utc(decreto.date).format("YYYY-MM-DD"))
            }
        }
        loadDecreto();
    }, [])

    const onSubmit = handleSubmit(async (data) => {
        const dataValid = {
            ...data,
            date: data.date ? dayjs.utc(data.date).format() : dayjs.utc().format(),
        };

        // Verificación si se está editando o creando un nuevo decreto
        if (params.id) {
            // Mostrar SweetAlert para confirmar la edición
            Swal.fire({
                title: "¿Actualizar Decreto?",
                showCancelButton: true,
                confirmButtonText: "Actualizar",
                confirmButtonColor: "#f1c40f",
                cancelButtonText: "Cancelar",
                cancelButtonColor: "#e74c3c"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // Solo se actualiza el Decreto si el usuario confirma
                    const response = await updateDecreto(params.id, dataValid);
                    if (response && response.status === 200) {
                        Swal.fire({
                            title: "Actualizada!",
                            icon: "success",
                            confirmButtonText: "OK",
                            confirmButtonColor: "#2ecc71"
                        });
                        navigate('/decretos');
                    } else {
                        Swal.fire("Error al actualizar", "Hubo un problema al actualizar el decreto", "error");
                    }
                }
            });
        } else {
            // Mostrar SweetAlert para confirmar la creación
            Swal.fire({
                title: "¿Guardar nuevo Decreto?",
                showCancelButton: true,
                confirmButtonText: "Guardar",
                confirmButtonColor: "#2ecc71",
                cancelButtonText: "Cancelar",
                cancelButtonColor: "#e74c3c"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // Solo se crea el Decreto si el usuario confirma
                    const response = await createDecreto(dataValid);
                    if (response && response.status === 200) {
                        Swal.fire({
                            title: "Guardado!",
                            icon: "success",
                            confirmButtonText: "OK",
                            confirmButtonColor: "#2ecc71"
                        });
                        navigate('/decretos');
                    } else {
                        Swal.fire("Error al guardar", "Hubo un problema al guardar el decreto", "error");
                    }
                }
            });
        };
    });

    return (
        <>
            <NavbarAdmin />
            <div className='flex h-[calc(100vh-100px)] items-center justify-center'>
                <div className='bg-zinc-800 text-white max-w-md w-full p-10 rounded-md'>
                    {
                        decretosErrors.map((error, i) => (
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
                        <label htmlFor="url">URL del decreto</label>
                        <input type="text" placeholder="URL" {...register('url', { required: true })} className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2' />
                        {errors.url && <p className='text-red-500'>Url requerida</p>}
                        <label htmlFor="date">Fecha</label>
                        <input className='w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2' type="date" {...register('date')} />

                        <button className="bg-indigo-500 px-4 py-1 rounded-sm">Guardar</button>
                        <Link to={'/decretos'} className="bg-red-500 px-4 py-1 ml-2 rounded-sm">Cancelar</Link>
                    </form>
                </div>
            </div>
        </>
    )
}

export default DecretosFormPage;