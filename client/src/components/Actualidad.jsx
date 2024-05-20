import { useEffect, useState } from "react";
import { getNoticesRequest } from "../api/notices";

const Actualidad = () => {

    const [notices, setNotices] = useState([]);

    const getNotices = async () => {
        try {
            const res = await getNoticesRequest();
            setNotices(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getNotices();
    }, []);

    return (
        <div className="md:px-14 p-4 max-w-screen-2xl mx-auto space-y-10" id='about'>
            <h2 className="md:text-5xl text-3xl font-extrabold">ACTUALIDAD</h2>
            <div className='flex items-center'>
                <button className="flex px-3 py-2 bg-primary mr-1 text-white font-semibold rounded">
                    <span>Noticias</span>
                </button>

                <button className="flex px-3 py-2 bg-secondary mr-1 text-white font-semibold rounded">
                    <span>Eventos</span>
                </button>

                <button className="flex px-3 py-2 bg-secondary mr-1 text-white font-semibold rounded">
                    <span>Proyectos</span>
                </button>
            </div>
            <div className='flex flex-col md:flex-row justify-between items-center gap-8'>
                <div className="container mx-auto p-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg border p-4">
                            <img src="https://placehold.co/300x200/d1d4ff/352cb5.png" alt="Placeholder Image" class="w-full h-48 rounded-md object-cover" />
                            <div className="px-1 py-4">
                                <div className="font-bold text-xl mb-2">Blog Title</div>
                                <p className="text-gray-700 text-base">
                                    This is a simple blog card example using Tailwind CSS. You can replace this text with your own blog content.
                                </p>
                            </div>
                            <div className="px-1 py-4">
                                <a href="#" class="text-blue-500 hover:underline">Read More</a>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border p-4">
                            <img src="https://placehold.co/300x200/d1d4ff/352cb5.png" alt="Placeholder Image" class="w-full h-48 rounded-md object-cover" />
                            <div className="px-1 py-4">
                                <div className="font-bold text-xl mb-2">Blog Title</div>
                                <p className="text-gray-700 text-base">
                                    This is a simple blog card example using Tailwind CSS. You can replace this text with your own blog content.
                                </p>
                            </div>
                            <div className="px-1 py-4">
                                <a href="#" class="text-blue-500 hover:underline">Read More</a>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border p-4">
                            <img src="https://placehold.co/300x200/d1d4ff/352cb5.png" alt="Placeholder Image" class="w-full h-48 rounded-md object-cover" />
                            <div className="px-1 py-4">
                                <div className="font-bold text-xl mb-2">Blog Title</div>
                                <p className="text-gray-700 text-base">
                                    This is a simple blog card example using Tailwind CSS. You can replace this text with your own blog content.
                                </p>
                            </div>
                            <div className="px-1 py-4">
                                <a href="#" class="text-blue-500 hover:underline">Read More</a>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border p-4">
                            <img src="https://placehold.co/300x200/d1d4ff/352cb5.png" alt="Placeholder Image" class="w-full h-48 rounded-md object-cover" />
                            <div className="px-1 py-4">
                                <div className="font-bold text-xl mb-2">Blog Title</div>
                                <p className="text-gray-700 text-base">
                                    This is a simple blog card example using Tailwind CSS. You can replace this text with your own blog content.
                                </p>
                            </div>
                            <div className="px-1 py-4">
                                <a href="#" class="text-blue-500 hover:underline">Read More</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="items-center flex justify-center">
                <button className="flex px-3 py-2 bg-primary text-white font-semibold rounded">
                    <span>Ver Más</span>
                </button>
            </div>
        </div>
    )
}

export default Actualidad