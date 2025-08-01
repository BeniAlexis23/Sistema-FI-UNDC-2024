import Navbar from '../components/Navbar'
import Footer from '../shared/Footer'

import Oseda from '../assets/d-oseda.webp'
import Vicente from '../assets/w-vicente.webp'
import Almidon from '../assets/c-almidon.webp'
import Roque from '../assets/e-roque.webp'
import Duran from '../assets/a-duran.webp'
import Pacheco from '../assets/a-pacheco.webp'
import Angoma from '../assets/m-angoma.webp'
import Ferreyros from '../assets/j-ferreyros.webp'
import Larico from '../assets/g-larico.webp'
import Asto from '../assets/l-asto.webp'
import Aranguena from '../assets/m-aranguena.webp'
import Huancahuire from '../assets/c-huancahuire.webp'

// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../variants';

const Departamento = () => {
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
                        Departamento Académico de Ingeniería de Sistemas
                    </h1>
                </motion.div>
                {/*Dr Roque*/}
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
                                        <img src={Asto} class="w-full relative z-10" alt="" />
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
                                        <p class="font-bold text-2xl mb-5">Director (e) del Departamento Académico de Ingenieria de Sistemas</p>
                                        <h1 className="font-bold text-3xl mb-5">M.Sc. Leonidas Asto Huamán</h1>
                                        <p class="text-sm text-justify lg:mr-10">De profesión, Ingeniero Informático y Sistemas con maestría en Informática,
                                            candidato a doctor en Ingeniería de Sistemas. Docente, con experiencia en universidades públicas y privadas.
                                            Asesor de tesis. Áreas de investigación: Machine Learning, Redes Neuronales, Interacción Humano Computador, IoT,
                                            Sistemas Inteligentes, Procesamiento Natural y BI. Con capacidad analizar, diseñar, construir, evaluar,
                                            diagnosticar, auditar y mantener sistemas informáticos aplicados en las diferentes áreas del conocimiento.
                                            Dedicado a la Administración de Sistemas GNU/Linux.</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/*Plana Docentes*/}
            <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-12">
                <div class="text-center pb-12">
                    <h1 class="font-bold text-3xl md:text-4xl lg:text-5xl font-heading text-gray-900">
                        Docentes Ordinarios
                    </h1>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7 }}
                    >
                        <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                            <div>
                                <img class="object-center object-cover h-auto w-full" src={Oseda} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">Ph.D. Dulio Oseda Gago</p>
                                <p class="text-base text-gray-400 font-normal">Docente Principal</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7 }}
                    >
                        <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                            <div>
                                <img class="object-center object-cover h-auto w-full" src={Larico} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">Dr. Guido Larico Uchamaco</p>
                                <p class="text-base text-gray-400 font-normal">Docente Principal</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7 }}
                    >
                        <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                            <div>
                                <img class="object-center object-cover h-auto w-full" src={Vicente} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">Dr. Wagner Vicente Ramos</p>
                                <p class="text-base text-gray-400 font-normal">Docente Principal</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7 }}
                    >
                        <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                            <div>
                                <img class="object-center object-cover h-auto w-full" src={Almidon} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">Dr. Carlos Almidon Ortiz</p>
                                <p class="text-base text-gray-400 font-normal">Docente Principal</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7 }}
                    >
                        <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                            <div>
                                <img class="object-center object-cover h-auto w-full" src={Roque} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">Dr. Edwin Roque Tito</p>
                                <p class="text-base text-gray-400 font-normal">Docente Principal</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7 }}
                    >
                        <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                            <div>
                                <img class="object-center object-cover h-auto w-full" src={Pacheco} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">Mg. Alex Pacheco Pumaleque</p>
                                <p class="text-base text-gray-400 font-normal">Docente Asociado</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7 }}
                    >
                        <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                            <div>
                                <img class="object-center object-cover h-auto w-full" src={Duran} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">Dra. Amanda Durán Carhuamaca</p>
                                <p class="text-base text-gray-400 font-normal">Docente Asociado</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7 }}
                    >
                        <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                            <div>
                                <img class="object-center object-cover h-auto w-full" src={Asto} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">M.Sc. Leonidas Asto Huamán</p>
                                <p class="text-base text-gray-400 font-normal">Docente Auxiliar</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7 }}
                    >
                        <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                            <div>
                                <img class="object-center object-cover h-auto w-full" src={Angoma} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">Dra. Miriam Angoma Astucuri</p>
                                <p class="text-base text-gray-400 font-normal">Docente Auxiliar</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7 }}
                    >
                        <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                            <div>
                                <img class="object-center object-cover h-auto w-full" src={Ferreyros} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">Dr. Jair Ferreyros Yucra</p>
                                <p class="text-base text-gray-400 font-normal">Docente Auxiliar</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7 }}
                    >
                        <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                            <div>
                                <img class="object-center object-cover h-auto w-full" src={Aranguena} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">M.Sc. Magaly Arangüena Yllanes</p>
                                <p class="text-base text-gray-400 font-normal">Docente Auxiliar</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.7 }}
                    >
                        <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                            <div>
                                <img class="object-center object-cover h-auto w-full" src={Huancahuire} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">M.Sc. Claudio Huancahuire Bravo</p>
                                <p class="text-base text-gray-400 font-normal">Docente Auxiliar</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default Departamento
