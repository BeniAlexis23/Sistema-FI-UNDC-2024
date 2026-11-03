import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import CoverPlaceholder from '../components/CoverPlaceholder';
import { Link } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";
import { getCategoriasRequest, getNoticiasRequest } from "../api/notices";
import { assetUrl } from '../utils/assetUrl';
import { formatNoticeDate } from '../utils/noticeDate';

// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../variants';

const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

const ITEMS_PER_PAGE = 12;

const Noticias = () => {

    const [noticias, setNoticias] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [status, setStatus] = useState('loading');

    const getNoticias = async () => {
        try {
            const [noticiasRes, categoriesRes] = await Promise.all([
                getNoticiasRequest(),
                getCategoriasRequest().catch(() => ({ data: [] })),
            ]);
            setNoticias(noticiasRes.data);
            setCategories(categoriesRes.data);
            setCurrentPage(1);
            setStatus('ready');
        } catch (error) {
            console.log(error);
            setStatus('error');
        }
    }

    useEffect(() => {
        getNoticias();
    }, []);

    // solo se ofrecen las categorías que tienen noticias publicadas
    const availableCategories = useMemo(
        () => categories.filter((category) => noticias.some((notice) => notice.category?.slug === category.slug)),
        [categories, noticias],
    );

    // las destacadas primero y luego las más recientes
    const orderedNoticias = useMemo(() => noticias
        .filter((notice) => selectedCategory === 'all' || notice.category?.slug === selectedCategory)
        .sort((a, b) => Number(b.featured) - Number(a.featured)
            || new Date(b.date) - new Date(a.date)
            || new Date(b.createdAt) - new Date(a.createdAt)), [noticias, selectedCategory]);
    const totalPages = Math.ceil(orderedNoticias.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageNoticias = orderedNoticias.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const featuredNoticias = pageNoticias.slice(0, 4);
    const compactNoticias = pageNoticias.slice(4);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryChange = (slug) => {
        setSelectedCategory(slug);
        setCurrentPage(1);
    };

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
                        <div className="mt-12">
                            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-slate-950 sm:text-3xl">
                                Ultimas noticias
                            </h2>

                            {availableCategories.length > 0 && (
                                <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
                                    {[{ slug: 'all', name: 'Todas' }, ...availableCategories].map((category) => (
                                        <button
                                            key={category.slug}
                                            type="button"
                                            onClick={() => handleCategoryChange(category.slug)}
                                            aria-pressed={selectedCategory === category.slug}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === category.slug
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {status === 'loading' && (
                                <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2" aria-hidden="true">
                                    {Array.from({ length: 4 }, (_, index) => (
                                        <div key={index} className="h-[260px] animate-pulse bg-slate-100" />
                                    ))}
                                </div>
                            )}

                            {status === 'error' && (
                                <p className="mt-7 border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                                    No pudimos cargar las noticias en este momento. Inténtalo nuevamente más tarde.
                                </p>
                            )}

                            {status === 'ready' && orderedNoticias.length === 0 && (
                                <p className="mt-7 border border-dashed border-slate-300 p-8 text-center text-slate-500">
                                    {selectedCategory === 'all' ? 'Aún no hay noticias publicadas.' : 'No hay noticias en esta categoría.'}
                                </p>
                            )}

                            {status === 'ready' && orderedNoticias.length > 0 && (
                            <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_1fr] lg:gap-7">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
                                    {featuredNoticias.map((notice) => (
                                        <Link
                                            key={notice._id}
                                            to={`/noticias/${notice._id}`}
                                            className="group relative block min-h-[260px] overflow-hidden bg-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)] sm:min-h-[300px] lg:min-h-[255px]"
                                        >
                                            {notice.imageUrl ? (
                                                <img
                                                    src={assetUrl(notice.imageUrl)}
                                                    alt={notice.imageAlt || notice.title}
                                                    loading="lazy"
                                                    className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                                                />
                                            ) : (
                                                <CoverPlaceholder className="absolute inset-0" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
                                            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                                                <p className="text-xs font-extrabold text-white sm:text-sm">
                                                    {formatNoticeDate(notice.date)} <span className="mx-2">|</span> Leer
                                                    {notice.isNew && <span className="ml-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[0.7rem] font-semibold">Nuevo</span>}
                                                </p>
                                                <h3 className="mt-2 max-w-xl text-xl font-extrabold leading-tight text-white sm:text-2xl lg:text-[1.65rem]">
                                                    {truncateText(notice.title, 96)}
                                                </h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                    {compactNoticias.map((notice) => (
                                        <Link
                                            key={notice._id}
                                            to={`/noticias/${notice._id}`}
                                            className="group grid min-h-[132px] grid-cols-[42%_1fr] overflow-hidden border border-slate-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_35px_rgba(15,23,42,0.08)] sm:min-h-[145px] lg:min-h-[122px]"
                                        >
                                            <div className="overflow-hidden bg-slate-100">
                                                {notice.imageUrl ? (
                                                    <img
                                                        src={assetUrl(notice.imageUrl)}
                                                        alt={notice.imageAlt || notice.title}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                                                    />
                                                ) : (
                                                    <CoverPlaceholder className="h-full w-full" />
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center p-4">
                                                <p className="text-xs font-extrabold text-slate-500 sm:text-sm">
                                                    {formatNoticeDate(notice.date)}
                                                    {notice.isNew && <span className="ml-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[0.7rem] font-semibold text-white">Nuevo</span>}
                                                </p>
                                                <h3 className="mt-2 text-[0.95rem] font-extrabold leading-snug text-slate-950 sm:text-base lg:text-[1.02rem]">
                                                    {truncateText(notice.title, 82)}
                                                </h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            )}

                            {totalPages > 1 && (
                                <nav className="mt-9 flex flex-wrap items-center justify-center gap-2" aria-label="Paginacion de noticias">
                                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => handlePageChange(page)}
                                            aria-current={currentPage === page ? 'page' : undefined}
                                            className={`h-10 min-w-10 px-4 text-sm font-bold transition ${currentPage === page
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="h-10 bg-primary px-5 text-sm font-bold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                                    >
                                        Siguiente
                                    </button>
                                </nav>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Noticias
