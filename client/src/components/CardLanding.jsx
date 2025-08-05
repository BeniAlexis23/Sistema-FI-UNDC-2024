import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CardLanding({ news }) {

    const [isBookmarked, setIsBookmarked] = useState(false)

    return (
        <div className="bg-white border-0 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden max-w-sm">
            {/* Imagen de la noticia */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={news.image || "https://via.placeholder.com/400x200"}
                    alt={news.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                {/* Categoría y bookmark */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#1081ea] hover:bg-[#0d6efd] text-white">
                        {news.category}
                    </span>
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
                <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 hover:text-[#1081ea] transition-colors cursor-pointer">
                    {news.title}
                </h3>

                {/* Metadatos */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        <span>{news.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span>{news.publishDate}</span>
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
                        <span>{news.readTime}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-0">
                {/* Resumen */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{news.summary}</p>

                {/* Botones de acción */}
                <div className="flex items-center justify-between">
                    <button className="h-8 px-2 text-gray-600 hover:text-[#1081ea] hover:bg-[#1081ea]/5 rounded-md inline-flex items-center justify-center text-sm font-medium transition-colors">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                            />
                        </svg>
                        <span className="text-sm">Compartir</span>
                    </button>

                    <Link
                        to={`/noticias/${news.id}`} className="h-9 px-3 bg-[#1081ea] hover:bg-[#0d6efd] text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-md inline-flex items-center justify-center text-sm font-medium group"

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