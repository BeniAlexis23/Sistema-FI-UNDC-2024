import { useCallback, useEffect, useState } from "react";
import { getNoticiasRequest } from "../api/notices";
import CardLanding from "./CardLanding";

import { Link } from 'react-router-dom';

const CardSkeleton = () => (
    <div className="h-[26rem] max-w-sm animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
);

const Actualidad = () => {

    const [noticias, setNoticias] = useState([]);
    const [status, setStatus] = useState('loading');

    // las destacadas van primero (hasta 3) y luego las más recientes por fecha
    const getNoticias = useCallback(async () => {
        setStatus('loading');
        try {
            const res = await getNoticiasRequest({ limit: 4, featuredFirst: 1 });
            setNoticias(res.data);
            setStatus('ready');
        } catch (error) {
            console.log(error);
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        getNoticias();
    }, [getNoticias]);

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
            <div className='flex flex-col md:flex-row justify-between items-center gap-8'>
                <div className="container mx-auto p-4">

                    {status === 'loading' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} />)}
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                            <p className="text-slate-600">No pudimos cargar las noticias en este momento.</p>
                            <button
                                type="button"
                                onClick={getNoticias}
                                className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {status === 'ready' && noticias.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                            Aún no hay noticias publicadas.
                        </p>
                    )}

                    {/*Card */}
                    {status === 'ready' && noticias.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                            {noticias.map((notice) => (
                                <CardLanding key={notice._id} news={notice} />
                            ))}
                        </div>
                    )}

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
