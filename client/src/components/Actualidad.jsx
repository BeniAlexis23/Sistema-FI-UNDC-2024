import { useEffect, useState } from "react";
import { getNoticiasRequest } from "../api/notices";

import { Link } from 'react-router-dom';

const Actualidad = () => {

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
            <div className='flex items-center'>
                <button className="flex px-3 py-2 bg-primary mr-1 text-white font-semibold rounded">
                    <span>Noticias</span>
                </button>

                {/*<button className="flex px-3 py-2 bg-secondary mr-1 text-white font-semibold rounded">
                    <span>Eventos</span>
                </button>

                <button className="flex px-3 py-2 bg-secondary mr-1 text-white font-semibold rounded">
                    <span>Proyectos</span>
                </button>*/}
            </div>
            <div className='flex flex-col md:flex-row justify-between items-center gap-8'>
                <div className="container mx-auto p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                        {
                            noticias.slice(-4).reverse().map((notice, index) => (
                                <div key={index} className="bg-white rounded-lg border p-4">
                                    <img src={`http://localhost:3000${notice.imageUrl}`} /*Produccion: 'https://fi.undc.edu.pe' */ alt="Placeholder Image" className="w-full h-48 rounded-md object-cover" />
                                    <div className="px-1 py-4">
                                        <h1 className="font-bold text-2xl mb-2">{notice.title}</h1>
                                    </div>
                                    <div className="px-1 py-1">
                                        <Link to={`/noticias/${notice._id}`} className="text-blue-500 hover:underline">Leer</Link>
                                    </div>
                                </div>
                            ))
                        }
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

export default Actualidad