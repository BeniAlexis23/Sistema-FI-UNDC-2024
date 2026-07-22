import { useEffect, useState } from "react";
import { getNoticiasRequest } from "../api/notices";
import { assetUrl } from "../utils/assetUrl";
import CardLanding from "./CardLanding";

import { Link } from 'react-router-dom';

const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

const Actualidad = () => {

    const maxLengthT = 50; // Longitud máxima del texto del Titulo

    const [noticias, setNoticias] = useState([]);

    const getNoticias = async () => {
        try {
            const res = await getNoticiasRequest();
            setNoticias(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getNoticias();
    }, []);

    return (
        <section className="mx-auto mt-12 mb-16 max-w-screen-2xl space-y-10 px-4 md:px-14" id='about'>
            <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
                    Información reciente
                </p>
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl xl:text-[3.35rem]">
                    Actualidad
                </h2>
            </div>
            {/*<div className='flex items-center'>
                <button className="flex px-3 py-2 bg-primary mr-1 text-white font-semibold rounded">
                    <span>Noticias</span>
                </button>
                <button className="flex px-3 py-2 bg-secondary mr-1 text-white font-semibold rounded">
                    <span>Eventos</span>
                </button>

                <button className="flex px-3 py-2 bg-secondary mr-1 text-white font-semibold rounded">
                    <span>Proyectos</span>
                </button>
            </div>*/}
            <div className='flex flex-col md:flex-row justify-between items-center gap-8'>
                <div className="container mx-auto p-4">

                    {/*Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                        {noticias.slice(-4).reverse().map((notice, index) => (
                            <CardLanding
                                key={index}
                                news={{
                                    title: notice.title,
                                    image: assetUrl(notice.imageUrl),
                                    author: notice.author || "Administrador",
                                    publishDate: new Date(notice.date).toLocaleDateString("es-PE") || "Fecha desconocida",
                                    readTime: notice.readTime || "2 min",
                                    summary: truncateText(notice.description, maxLengthT) || "Sin resumen",
                                    category: notice.category || "General",
                                    id: notice._id
                                }}
                            />
                        ))}
                    </div>

                </div>
            </div>
            <div className="flex justify-center pt-2">
                <Link
                    to={"/noticias"}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-secondary"
                >
                    <span>Ver más</span>
                </Link>
            </div>
        </section>
    )
}

export default Actualidad;
