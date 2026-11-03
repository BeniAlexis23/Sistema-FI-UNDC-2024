import { useState } from 'react';
import { Link } from 'react-router-dom';
import CoverPlaceholder from './CoverPlaceholder';
import ShareButton from '../cms/ShareButton';
import { assetUrl } from '../utils/assetUrl';
import { formatShortDate } from '../utils/noticeDate';

/* `news` es una noticia tal como la devuelve /api/noticias */
export default function CardLanding({ news }) {

    const [isBookmarked, setIsBookmarked] = useState(false)
    const noticeLink = `/noticias/${news._id}`;

    return (
        <div className="bg-white border-0 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden max-w-sm">
            {/* Imagen de la noticia */}
            <div className="relative h-48 overflow-hidden">
                {news.imageUrl ? (
                    <img
                        src={assetUrl(news.imageUrl)}
                        alt={news.imageAlt || news.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                ) : (
                    <CoverPlaceholder className="h-full w-full" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                {/* Categoría, novedad y bookmark */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className="flex flex-wrap items-center gap-2">
                        {news.category && (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#1081ea] hover:bg-[#0d6efd] text-white">
                                {news.category.name}
                            </span>
                        )}
                        {news.isNew && (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500 text-white">
                                Nuevo
                            </span>
                        )}
                    </div>
                    <button
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white border-0 shadow-sm rounded-md inline-flex items-center justify-center transition-colors"
                        onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                        <svg
                            className={`h-4 w-4 ${isBookmarked ? "fill-[#1081ea] text-[#1081ea]" : "text-gray-600"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col space-y-1.5 p-6 pb-3">
                <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 hover:text-[#1081ea] transition-colors">
                    <Link to={noticeLink}>{news.title}</Link>
                </h3>

                {/* Metadatos */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                    {news.byline && (
                        <div className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            <span>{news.byline}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span>{formatShortDate(news.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{news.readingMinutes} min</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-0">
                {/* Resumen */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{news.description}</p>

                {/* Botones de acción */}
                <div className="flex items-center justify-between">
                    <ShareButton
                        notice={news}
                        className="h-8 px-2 text-gray-600 hover:text-[#1081ea] hover:bg-[#1081ea]/5 rounded-md inline-flex items-center justify-center text-sm font-medium transition-colors"
                    />

                    <Link
                        to={noticeLink} className="h-9 px-3 bg-[#1081ea] hover:bg-[#0d6efd] text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-md inline-flex items-center justify-center text-sm font-medium group"

                    >
                        Leer más
                        <svg
                            className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    )
}
