import Navbar from '../components/Navbar'
import Footer from '../shared/Footer'
import Asto from '../assets/l-asto.png'

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
                                        <p class="font-bold text-2xl mb-5">Director (e) de la Escuela Profesional de Ingeniería de Sistemas</p>
                                        <h1 className="font-bold text-3xl mb-5">Mg. Leonidas Asto Huamán</h1>
                                        <p class="text-sm text-justify lg:mr-10">De profesión, Ingeniero Informático y Sistemas con maestría en Informática, candidato a doctor en Ingeniería de Sistemas. Docente, con experiencia
                                            en universidades públicas y privadas. Asesor de tesis. Áreas de investigación: Machine Learning, Redes Neuronales, Interacción Humano Computador, IoT, Sistemas Inteligentes,
                                            Procesamiento Natural y BI. Con capacidad analizar, diseñar, construir, evaluar, diagnosticar, auditar y mantener sistemas informáticos aplicados en las diferentes áreas del
                                            conocimiento. Dedicado a la Administración de Sistemas GNU/Linux.</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default Escuela
