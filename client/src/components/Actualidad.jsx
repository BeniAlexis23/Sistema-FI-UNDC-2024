import { useEffect, useState } from "react";
import { getNoticiasRequest } from "../api/notices";
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
        <div className="md:px-14 p-4 max-w-screen-2xl mx-auto space-y-10" id='about'>
            <h2 className="md:text-5xl text-3xl font-extrabold">ACTUALIDAD</h2>
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
                                    image: `http://localhost:3000${notice.imageUrl}`/*Produccion: 'https://fi.undc.edu.pe' */,
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
            <div className="items-center flex justify-center">
                <Link to={"/noticias"} className="flex px-3 py-2 bg-primary hover:bg-secondary text-white font-semibold rounded hover:text-gray-300 cursor-pointer">
                    <span>Ver Más</span>
                </Link>
            </div>
        </div>
    )
}

export default Actualidad;