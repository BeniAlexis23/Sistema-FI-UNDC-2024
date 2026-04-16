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

const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

const getCardClassName = (index) => {
    if (index === 0) {
        return "lg:col-span-2 lg:row-span-2";
    }

    return "";
};

const Noticias = () => {

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
        <>
            <Navbar />

            <div className="relative isolate overflow-hidden bg-white px-6 pt-32 lg:overflow-visible lg:px-0">
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
                            className="space-y-4"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-primary/80 sm:text-sm">
                                Actualidad institucional
                            </p>
                            <h1 className="text-4xl font-extrabold uppercase tracking-tight text-gray-900 sm:text-5xl xl:text-[3.4rem]">
                                Noticias FI
                            </h1>
                            <div className="h-1.5 w-24 rounded-full bg-primary" />
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
                                    <p className="text-gray-900 text-justify mt-8 md:text-2xl">¡Bienvenido a la sección de Noticias de la FI! Aquí encontrarás las últimas actualizaciones
                                        y acontecimientos más relevantes relacionados con nuestra institución y el mundo académico. Desde innovadores proyectos de
                                        investigación y eventos destacados hasta logros de nuestros estudiantes y profesores, esta sección está diseñada para mantenerte
                                        informado sobre todo lo que sucede en la comunidad de FI. Explora nuestras noticias y descubre cómo estamos contribuyendo al
                                        avance del conocimiento y la tecnología.</p>
                                </div>
                            </motion.div>
                        </div>
                        <div className="mt-10">
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 lg:auto-rows-[230px]">
                                {
                                    noticias.slice().reverse().map((notice, index) => (
                                        <article
                                            key={notice._id || index}
                                            className={`group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_55px_rgba(15,23,42,0.1)] ${getCardClassName(index)}`}
                                        >
                                            {index === 0 ? (
                                                <div className="relative h-[360px] sm:h-[460px] lg:h-full">
                                                    <img
                                                        src={`http://localhost:3000${notice.imageUrl}`}
                                                        alt={notice.title}
                                                        className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
                                                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                                                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/85 sm:text-base">
                                                            {dayjs(notice.date).utc().format("DD MMM, YYYY")}  |  Leer
                                                        </p>
                                                        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl xl:text-[2.9rem]">
                                                            {notice.title}
                                                        </h2>
                                                        <div className="mt-6">
                                                            <Link
                                                                to={`/noticias/${notice._id}`}
                                                                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-sky-100"
                                                            >
                                                                Leer noticia
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid h-full grid-cols-1 sm:grid-cols-[0.95fr_1.05fr] lg:grid-cols-[0.9fr_1.1fr]">
                                                    <div className="overflow-hidden">
                                                        <img
                                                            src={`http://localhost:3000${notice.imageUrl}`}
                                                            alt={notice.title}
                                                            className="h-full min-h-[220px] w-full object-cover object-center transition duration-500 group-hover:scale-[1.03] sm:min-h-full"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col justify-center p-5 sm:p-6">
                                                        <p className="text-base font-bold text-slate-500 sm:text-[1.05rem]">
                                                            {dayjs(notice.date).utc().format("DD MMM, YYYY")}
                                                        </p>
                                                        <h3 className="mt-3 text-2xl font-extrabold leading-tight text-slate-900 sm:text-[1.95rem] lg:text-[2.1rem]">
                                                            {truncateText(notice.title, 90)}
                                                        </h3>
                                                        <div className="mt-5">
                                                            <Link
                                                                to={`/noticias/${notice._id}`}
                                                                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary"
                                                            >
                                                                Leer más
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </article>
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
