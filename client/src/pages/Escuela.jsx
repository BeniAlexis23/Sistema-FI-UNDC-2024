import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import Vicente from '../assets/w-vicente.webp';
import Programacion from '../assets/programacion.webp'
import { Link } from 'react-router-dom';

import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { MdCheckCircle } from "react-icons/md";
import { HiDocumentArrowDown } from "react-icons/hi2";
import { GrDocumentUser } from "react-icons/gr";
import { FaUserGraduate } from "react-icons/fa6";

// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../variants';

const Escuela = () => {
    return (
        <>
            <Navbar />
            <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
                <motion.div
                    variants={fadeIn("right", 0.2)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: true, amount: 0.7 }}
                >
                    <h1 class="mt-24 mb-4 font-bold text-3xl md:text-4xl lg:text-5xl text-center font-heading text-gray-900">
                        Escuela Profesional de Ingeniería de Sistemas
                    </h1>
                </motion.div>
                {/*Mg Asto*/}
                <div class="flex items-center -mt-4 p-5 lg:p-5 overflow-hidden relative">
                    <div class="w-full max-w-6xl rounded shadow-xl p-5 lg:p-5 mx-auto text-gray-800 relative md:text-left">
                        <div class="md:flex items-center -mx-10">
                            <div class="w-full md:w-1/2 px-10 mb-10 md:mb-0 lg:ml-2">
                                <div class="relative">
                                    <motion.div
                                        variants={fadeIn("left", 0.2)}
                                        initial="hidden"
                                        whileInView={"show"}
                                        viewport={{ once: true, amount: 0.7 }}
                                    >
                                        <img src={Vicente} class="w-full relative z-10" alt="" />
                                    </motion.div>
                                </div>
                            </div>
                            <div class="w-full md:w-1/2 px-10">
                                <motion.div
                                    variants={fadeIn("up", 0.2)}
                                    initial="hidden"
                                    whileInView={"show"}
                                    viewport={{ once: true, amount: 0.7 }}
                                >
                                    <div class="mb-10">
                                        <p class="font-bold text-2xl mb-5">Director (e) de la Escuela Profesional de Ingeniería de Sistemas</p>
                                        <h1 className="font-bold text-3xl mb-5">Dr. Wagner Enoc Vicente Ramos</h1>
                                        <p class="text-sm text-justify lg:mr-10">Docente investigador de la Universidad Nacional de Cañete, con más de 15 años
                                            de experiencia en pre y posgrado. Doctor en Sistemas de Ingeniería, Magister en Gestión Educativa, Ingeniero de Sistemas
                                            y actual doctorando en Ciencias Económicas por la Universidad de Buenos Aires (Argentina). Desempeñé cargos de Director
                                            de Escuela de Ingeniería de Sistemas y Computación, Coordinador de Investigación de Ciencias de la Empresa, Coordinador
                                            de la Facultad de Ingeniería y Director de Escuela de Posgrado. Conferencista y par evaluador en congresos nacionales e
                                            internacionales como investigador RENACYT y miembro activo de IEEE Computer Society desarrollo temas de investigación
                                            entorno a ciencias de las organizaciones, transformación digital e inteligencia artificial; así mismo, soy integrante
                                            del comité editorial y revisor de diversas revistas científicas indexadas a Latindex y Scopus.</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="py-16 bg-white">
                    <div class="container m-auto px-6 text-gray-600 md:px-12 xl:px-6">
                        <h2 class="text-gray-900 font-bold text-3xl md:text-4xl mb-4">Perfil del Egresado en Ingeniería de Sistemas</h2>
                        <div class="space-y-6 md:space-y-0 md:flex md:gap-6 lg:items-center lg:gap-12">
                            <div class="md:5/12 lg:w-5/12">
                                <img src={Programacion} alt="image" loading="lazy" width="" height="" />
                            </div>
                            <div class="md:7/12 lg:w-6/12">
                                <p class="mt-6 text-gray-600 text-justify">
                                    La Escuela Profesional de Ingeniería de Sistemas promueve las competencias específicas basadas en el desarrollo de la persona
                                    con habilidades, conocimientos y capacidades para un adecuado desenvolvimiento profesional en el campo Ingeniería de sistemas.
                                </p>
                                <p class="mt-2 text-gray-600 text-justify">
                                    El egresado en Ingeniería de Sistemas, bajo un enfoque de competencias, busca fortalecer el vínculo con el sector laboral y
                                    potenciar el capital humano en un contexto de constantes cambios. Desarrolla competencias específicas en software, redes de
                                    comunicación (LAN y WAN), TIC con estándares internacionales, y soluciones de ciencia de datos e inteligencia artificial, con
                                    la investigación como eje central para la innovación y transferencia de conocimiento.
                                </p>
                                <p class="mt-2 text-gray-600 text-justify">El egresado en Ingeniería de Sistemas tendrá el potencial para convertirse en un profesional
                                    Exitoso y contribuir al crecimiento y desarrollo en el sector de la tecnología e informática, son sólidos conocimientos.</p>
                            </div>
                        </div>
                        <div class="my-10 md:flex md:flex-col lg:gap-12">
                            <h2 class="text-gray-900 font-bold text-3xl md:text-4xl mb-4 md:-mb-5">Objetivos Académicos</h2>
                            <div>
                                <ul class="list-disc pl-6 space-y-4 text-gray-600 text-justify">
                                    <li>Promover y desarrollar labores de investigación científica y tecnológica de carácter multidisciplinario y con la participación de docentes y estudiantes, para mejorar habilidades y generar conocimientos técnicos y científicos, a fin de contribuir con responsabilidad social con el desarrollo del país.</li>
                                    <li>Promover la participación de los estudiantes de ingeniería de sistemas en actividades extracurriculares, tales como, círculos de estudios y proyectos de investigación interdisciplinaria, que integren los procesos empresariales con las tecnologías de información.</li>
                                    <li>Integrar a los estudiantes con graduados y empleadores exitosos para que, a través de la Información de sus experiencias, conozcan sobre los éxitos en la profesión de ingeniería de sistemas, con el fin de motivarlos.</li>
                                    <li>Propiciar la capacitación permanente del personal docente con la finalidad de estar a la vanguardia en los conocimientos de los temas relacionados a la ingeniería de sistemas.</li>
                                    <li>Atender las necesidades u los cambios que adoptan las organizaciones, en respuesta a las fluctuaciones del mercado, proporcionándoles profesionales calificados que ayuden a alcanzar sus objetivos estratégicos mediante el uso de las tecnologías de la información.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="my-10 md:flex md:flex-col lg:gap-12">
                            <h2 class="text-gray-900 font-bold text-3xl md:text-4xl mb-4 md:-mb-5">Conceptual</h2>
                            <div>
                                <ul class="list-disc pl-6 space-y-4 text-gray-600 text-justify">
                                    <li>Conoce e integra conocimientos de las ciencias básicas, ciencias de la computación y ciencias de la empresa para la solución de problemas.</li>
                                    <li>Distingue y explica las diferentes fases de la solución de un problema.</li>
                                    <li>Conoce las metodologías del enfoque sistémico y científico, para el desarrollo de propuestas de solución a problemas del mundo real.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="my-10 md:flex md:flex-col lg:gap-12">
                            <h2 class="text-gray-900 font-bold text-3xl md:text-4xl mb-4 md:-mb-5">Procedimental</h2>
                            <div>
                                <ul class="list-disc pl-6 space-y-4 text-gray-600 text-justify">
                                    <li>Aplica efectivamente la teoría General de Sistemas y el Pensamiento Sistémico en la compresión y solución de problemas organizacionales.</li>
                                    <li>Modela, Simula, Implementa y Optimiza Sistemas Complejos, bajo el soporte de las tecnologías de información y Comunicación.</li>
                                    <li>Planifica, Analiza, Diseña y Desarrolla sistemas de información y comunicación para diversos tipos de organizaciones.</li>
                                    <li>Modela unidades de negocio en las organizaciones.</li>
                                    <li>Aplica ingeniería de información integrados.</li>
                                    <li>Integra la información organizacional.</li>
                                    <li>Diseña e Implementa redes globales de comunicación de datos.</li>
                                    <li>Gerencia organizaciones empresariales, desarrollando estrategias para el logro de ventajas competitivas sostenibles.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="my-10 md:flex md:flex-col lg:gap-12">
                            <h2 class="text-gray-900 font-bold text-3xl md:text-4xl mb-4 md:-mb-5">Actitudinales</h2>
                            <div>
                                <ul class="list-disc pl-6 space-y-4 text-gray-600 text-justify">
                                    <li>Ser proactivo hacia la investigación y actualización en tecnología de información y comunicaciones.</li>
                                    <li>Ejerce su labor con creatividad, responsabilidad y ética.</li>
                                    <li>Orienta su profesión al desarrollo regional y nacional, en base a la compresión de la realidad en sus diversas manifestaciones.</li>
                                    <li>No tiene temor de promover en su campo una iniciativa con efectos de carácter mundial.</li>
                                    <li>Promueve la generación de empresas.</li>
                                    <li>Impulsa la aplicación nuevas tecnologías de información y comunicación en la empresa.</li>
                                    <li>Promueve los cambios económicos, sociales, científicos y tecnológicos en el marco del desarrollo humano.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="my-10 md:flex md:flex-col lg:gap-12 text-justify">
                            <h2 className="text-gray-900 font-bold text-3xl md:text-4xl mb-4 md:-mb-5">Grados y Títulos</h2>
                            <div>
                                <ul className="pl-4 space-y-4 text-gray-600">
                                    <li className="flex items-start">
                                        <FaUserGraduate className="mr-2 text-2xl inline" />
                                        <span>Grado Académico: Bachiller en Ingeniería de Sistemas.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <FaUserGraduate className="mr-2 text-2xl inline" />
                                        <span>Título Profesional: Ingeniero de Sistemas.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {/*Cards */}
                        <h4 class="text-2xl mt-6 text-gray-900 font-bold inline-flex items-start">
                            <MdCheckCircle class="mr-2 inline" />
                            Planes de estudios vigentes
                        </h4>
                        <div class="md:min-w-[700px] xl:min-w-[800px] mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 justify-center mx-auto">
                            <div class="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] border-[2px] bg-white shadow-md dark:border-[#00000033]">
                                <div class="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                                    <div class="rounded-full bg-lightPrimary p-3 dark:bg-gray-300">
                                        <span class="flex items-center text-brand-500 text-black text-3xl">
                                            <HiOutlineClipboardDocumentList />
                                        </span>
                                    </div>
                                </div>
                                <div class="h-50 ml-4 flex w-auto flex-col justify-center">
                                    <Link to={"https://drive.google.com/file/d/1ve1jDeKrh475vw2V3dyF3pU9BkzsWcSx/view?usp=sharing"} target='_blank'><h4 class="text-xl font-bold text-navy-700 text-black">Plan de estudios 2024</h4></Link>
                                </div>
                            </div>
                            <div class="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] border-[2px] bg-white shadow-md dark:border-[#00000033]">
                                <div class="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                                    <div class="rounded-full bg-lightPrimary p-3 dark:bg-gray-300">
                                        <span class="flex items-center text-brand-500 text-black text-3xl">
                                            <HiOutlineClipboardDocumentList />
                                        </span>
                                    </div>
                                </div>
                                <div class="h-50 ml-4 flex w-auto flex-col justify-center">
                                    <Link to={"https://drive.google.com/file/d/16v8FIV--vDkHz8Mg6jP-YQvrMduPtHKF/view?usp=sharing"} target='_blank'><h4 class="text-xl font-bold text-navy-700 text-black">Plan de estudios 2016</h4></Link>
                                </div>
                            </div>
                        </div>
                        <h4 class="text-2xl mt-20 text-gray-900 font-bold inline-flex items-start">
                            <MdCheckCircle class="mr-2 inline" />
                            Documentos de Practicas-Preprofesionales
                        </h4>
                        <div class="md:min-w-[700px] xl:min-w-[800px] mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 justify-center mx-auto">
                            <div class="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] border-[2px] bg-white shadow-md dark:border-[#00000033]">
                                <div class="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                                    <div class="rounded-full bg-lightPrimary p-3 dark:bg-gray-300">
                                        <span class="flex items-center text-brand-500 text-black text-3xl">
                                            <GrDocumentUser />
                                        </span>
                                    </div>
                                </div>
                                <div class="h-50 ml-4 flex w-auto flex-col justify-center">
                                    <Link to={"https://drive.google.com/drive/folders/10no5Ew5dja2WeSYvEDC7FYmhFYy4NalP?usp=sharing"} target='_blank'><h4 class="text-xl font-bold text-navy-700 text-black">Reglamento de PPP</h4></Link>
                                </div>
                            </div>
                            <div class="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] border-[2px] bg-white shadow-md dark:border-[#00000033]">
                                <div class="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                                    <div class="rounded-full bg-lightPrimary p-3 dark:bg-gray-300">
                                        <span class="flex items-center text-brand-500 text-black text-3xl">
                                            <HiDocumentArrowDown />
                                        </span>
                                    </div>
                                </div>
                                <div class="h-50 ml-4 flex w-auto flex-col justify-center">
                                    <Link to={"https://drive.google.com/drive/folders/1s8yv6N1PvbwZBLpKKxeUWcKWSFWRB0r3?usp=sharing"} target='_blank'><h4 class="text-xl font-bold text-navy-700 text-black">Formatos de PPP</h4></Link>
                                </div>
                            </div>
                        </div>
                        <h4 class="text-2xl mt-20 text-gray-900 font-bold inline-flex items-start">
                            <MdCheckCircle class="mr-2 inline" />
                            Documentos de RSU
                        </h4>
                        <div class="md:min-w-[700px] xl:min-w-[800px] mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 justify-center mx-auto">
                            <div class="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] border-[2px] bg-white shadow-md dark:border-[#00000033]">
                                <div class="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                                    <div class="rounded-full bg-lightPrimary p-3 dark:bg-gray-300">
                                        <span class="flex items-center text-brand-500 text-black text-3xl">
                                            <GrDocumentUser />
                                        </span>
                                    </div>
                                </div>
                                <div class="h-50 ml-4 flex w-auto flex-col justify-center">
                                    <Link to={"https://drive.google.com/file/d/1XN9mCYqLui66LLy34WULbCk9G9zHJVHv/view?usp=sharing"} target='_blank'><h4 class="text-xl font-bold text-navy-700 text-black">Reglamento de RSU</h4></Link>
                                </div>
                            </div>
                            <div class="relative flex flex-grow !flex-row flex-col items-center rounded-[10px] border-[2px] bg-white shadow-md dark:border-[#00000033]">
                                <div class="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                                    <div class="rounded-full bg-lightPrimary p-3 dark:bg-gray-300">
                                        <span class="flex items-center text-brand-500 text-black text-3xl">
                                            <HiDocumentArrowDown />
                                        </span>
                                    </div>
                                </div>
                                <div class="h-50 ml-4 flex w-auto flex-col justify-center">
                                    <Link to={"https://portal.undc.edu.pe/proyeccionsocial/base-legal/"} target='_blank'><h4 class="text-xl font-bold text-navy-700 text-black">Formatos de RSU</h4></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default Escuela;