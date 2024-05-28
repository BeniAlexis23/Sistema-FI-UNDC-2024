import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import { Link } from "react-router-dom";


import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc)

import { useEffect, useState } from "react";
import { getNoticiasRequest } from "../api/notices";

// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../variants';

const Noticias = () => {

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
        <>
            <Navbar />

            <div className="relative isolate overflow-hidden bg-white px-6 py-32 lg:overflow-visible lg:px-0">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <svg className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]" aria-hidden="true">
                        <defs>
                            <pattern id="e813992c-7d03-4cc4-a2bd-151760b470a0" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
                                <path d="M100 200V.5M.5 .5H200" fill="none" />
                            </pattern>
                        </defs>
                        <svg x="50%" y="-1" className="overflow-visible fill-gray-50">
                            <path d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z" strokeWidth="0" />
                        </svg>
                        <rect width="100%" height="100%" strokeWidth="0" fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
                    </svg>
                </div>
                {/* Titulo */}
                <div className="container mx-auto max-w-screen-xl grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 lg:items-start lg:gap-y-10 px-6">
                    <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                        <motion.div
                            variants={fadeIn("right", 0.2)}
                            initial="hidden"
                            whileInView={"show"}
                            viewport={{ once: true, amount: 0.7 }}
                        >
                            <h1 className="mt-2 mb-8 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">NOTICIAS - FI</h1>
                        </motion.div>
                    </div>
                </div>
                {/* Descripcion */}
                <div className="max-w-screen-xl mx-auto">
                    <div className="px-6 text-gray-600 md:px-12 xl:px-6">
                        <div className="space-y-6 md:space-y-0 md:flex md:gap-6 lg:items-center lg:gap-12">
                            <motion.div
                                variants={fadeIn("up", 0.2)}
                                initial="hidden"
                                whileInView={"show"}
                                viewport={{ once: true, amount: 0.7 }}
                            >
                                <div className="max-w-screen">
                                    <p className="text-gray-900 text-justify md:text-2xl">¡Bienvenido a la sección de Noticias de la FI! Aquí encontrarás las últimas actualizaciones
                                        y acontecimientos más relevantes relacionados con nuestra institución y el mundo académico. Desde innovadores proyectos de
                                        investigación y eventos destacados hasta logros de nuestros estudiantes y profesores, esta sección está diseñada para mantenerte
                                        informado sobre todo lo que sucede en la comunidad de FI. Explora nuestras noticias y descubre cómo estamos contribuyendo al
                                        avance del conocimiento y la tecnología.</p>
                                </div>
                            </motion.div>
                        </div>
                        <div className="flex justify-center px-5 mt-10">
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
                                {
                                    noticias.slice().reverse().map((notice, index) => (
                                        <div key={index} className="relative flex w-full max-w-[48rem] flex-row rounded-xl bg-secondary bg-clip-border text-white shadow-md">
                                            <div className="relative m-0 w-2/5 shrink-0 overflow-hidden rounded-xl rounded-r-none bg-zinc-800 bg-clip-border">
                                                <img
                                                    src={notice.imageUrl}
                                                    alt="image"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="p-6">
                                                <p className="text-white">{dayjs(notice.date).utc().format("DD/MM/YYYY")}</p>
                                                <h4 className="mb-2 block font-sans text-2xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
                                                    {notice.title}
                                                </h4>

                                                <div className="flex gap-x-2 items-center mt-4">
                                                    <Link to={'/noticias'} className="bg-primary px-4 py-1 rounded-sm" >Leer</Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Noticias