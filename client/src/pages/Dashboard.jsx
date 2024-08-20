import NavbarAdmin from "../components/NavbarAdmin";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { getNoticiasRequest } from "../api/notices";
import { getResolucionesRequest } from "../api/rcfs";

import { FaEye } from "react-icons/fa";
import { AiFillFileAdd } from "react-icons/ai";
import { FaArrowAltCircleRight } from "react-icons/fa";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {

    const [noticias, setNoticias] = useState([]);
    const [resoluciones, setResoluciones] = useState([]);

    const getNoticias = async () => {
        try {
            const res = await getNoticiasRequest();
            setNoticias(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    const getResoluciones = async () => {
        try {
            const res = await getResolucionesRequest();
            setResoluciones(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getNoticias();
    }, []);

    useEffect(() => {
        getResoluciones();
    }, []);

    return (
        <>
            <NavbarAdmin />
            <div className="flex">
                {/* Sidebar */}
                <Sidebar />
                {/* Cards container */}
                <div className="flex-grow p-10">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                        <div className="relative bg-white py-6 px-6 rounded-3xl w-64 my-4 shadow-xl">
                            <div className="text-white flex items-center absolute rounded-full py-4 px-4 shadow-xl bg-pink-500 left-4 -top-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="mt-8">
                                <p className="text-xl font-semibold my-2">Noticias</p>
                                <Link to={"/notices"} className="flex items-center space-x-2 text-base my-3">
                                    <FaEye />
                                    <p className="text-gray-500">Ver Noticias</p>
                                </Link>
                                <Link to='/add-notice' className="flex items-center space-x-2 text-base my-3">
                                    <AiFillFileAdd />
                                    <p className="text-gray-500">Agregar Noticias</p>
                                </Link>
                                <div className="border-t-2"></div>
                                <div className="flex justify-between">
                                    <div className="my-2">
                                        <p className="font-semibold text-base mb-2">N° Noticias</p>
                                        <div className="flex items-center space-x-2 text-base">
                                            <FaArrowAltCircleRight />
                                            <p>{noticias.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Repite los otros cards aquí */}

                        <div className="relative bg-white py-6 px-6 rounded-3xl w-64 my-4 shadow-xl">
                            <div className="text-white flex items-center absolute rounded-full py-4 px-4 shadow-xl bg-green-500 left-4 -top-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="mt-8">
                                <p className="text-xl font-semibold my-2">Resoluciones CF</p>
                                <Link to={"/rcfs"} className="flex items-center space-x-2 text-base my-3">
                                    <FaEye />
                                    <p className="text-gray-500">Ver RCF</p>
                                </Link>
                                <Link to='/add-rcf' className="flex items-center space-x-2 text-base my-3">
                                    <AiFillFileAdd />
                                    <p className="text-gray-500">Agregar RCF</p>
                                </Link>
                                <div className="border-t-2"></div>
                                <div className="flex justify-between">
                                    <div className="my-2">
                                        <p className="font-semibold text-base mb-2">N° RCF</p>
                                        <div className="flex items-center space-x-2 text-base">
                                            <FaArrowAltCircleRight />
                                            <p>{resoluciones.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Repite los otros cards aquí */}

                        <div className="relative bg-white py-6 px-6 rounded-3xl w-64 my-4 shadow-xl">
                            <div className="text-white flex items-center absolute rounded-full py-4 px-4 shadow-xl bg-blue-500 left-4 -top-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="mt-8">
                                <p className="text-xl font-semibold my-2">Formatos Estudiantes</p>
                                <div className="flex items-center space-x-2 text-base my-3">
                                    <FaEye />
                                    <p className="text-gray-500">Ver Formatos E.</p>
                                </div>
                                <div className="flex items-center space-x-2 text-base my-3">
                                    <AiFillFileAdd />
                                    <p className="text-gray-500">Agregar Formatos E.</p>
                                </div>
                                <div className="border-t-2"></div>
                                <div className="flex justify-between">
                                    <div className="my-2">
                                        <p className="font-semibold text-base mb-2">N° Formatos</p>
                                        <div className="flex items-center space-x-2 text-base">
                                            <FaArrowAltCircleRight />
                                            <p>0</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Repite los otros cards aquí */}

                        <div className="relative bg-white py-6 px-6 rounded-3xl w-64 my-4 shadow-xl">
                            <div className="text-white flex items-center absolute rounded-full py-4 px-4 shadow-xl bg-yellow-500 left-4 -top-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                </svg>
                            </div>
                            <div className="mt-8">
                                <p className="text-xl font-semibold my-2">Formatos SIG</p>
                                <div className="flex items-center space-x-2 text-base my-3">
                                    <FaEye />
                                    <p className="text-gray-500">Ver Formatos SIG</p>
                                </div>
                                <div className="flex items-center space-x-2 text-base my-3">
                                    <AiFillFileAdd />
                                    <p className="text-gray-500">Agregar Formatos SIG</p>
                                </div>
                                <div className="border-t-2"></div>
                                <div className="flex justify-between">
                                    <div className="my-2">
                                        <p className="font-semibold text-base mb-2">N°  Formatos</p>
                                        <div className="flex items-center space-x-2 text-base">
                                            <FaArrowAltCircleRight />
                                            <p>0</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;