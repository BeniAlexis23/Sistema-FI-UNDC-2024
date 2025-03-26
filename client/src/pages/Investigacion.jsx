import Navbar from '../components/Navbar'
import Footer from '../shared/Footer'
import Duran from '../assets/a-duran.png'
// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../variants';

const Investigacion = () => {
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
                        Unidad de Investigación de la Facultad de Ingeniería
                    </h1>
                </motion.div>
                {/*Dr Almidon*/}
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
                                        <img src={Duran} class="w-full relative z-10" alt="" />
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
                                        <p class="font-bold text-2xl mb-5">Director (e) de la Unidad de Investigación de la Facultad de Ingeniería</p>
                                        <h1 className="font-bold text-3xl mb-5">Dra. Amanda Duran Carhuamaca</h1>
                                        <p class="text-sm text-justify lg:mr-10">Profesional encauzada en alcanzar objetivos con base en el uso de tecnología. Magister en Informática de
                                            la Pontificia Universidad Católica del Perú, Ingeniera de Sistemas, candidata a Doctora en Ingeniería de Sistemas, Doctorado en Docencia Universitaria.
                                            Con experiencia en la gestión y dirección de proyectos en diferentes organizaciones. Analista Funcional de proyectos de software. Experiencia en
                                            docencia universitaria (13 años). Directora de la EAP de Ingeniería de Sistemas. Docente- investigadora en más de 10 de universidades. Expositora
                                            de temas de vanguardia en investigación y tecnología.</p>
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

export default Investigacion
