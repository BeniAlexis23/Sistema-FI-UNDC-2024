import Navbar from '../components/Navbar'
import Footer from '../shared/Footer'
import Roque from '../assets/e-roque.jpg'
import Vicente from '../assets/w-vicente.png'
import Oseda from '../assets/d-oseda.png'
import Duran from '../assets/a-duran.png'
import Angoma from '../assets/m-angoma.png'
import Pacheco from '../assets/a-pacheco.png'
import Larico from '../assets/g-larico.png'
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
                                        <img src={Oseda} class="w-full relative z-10" alt="" />
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
                                        <h1 className="font-bold text-3xl mb-5">Ph.D. Dulio Oseda Gago</h1>
                                        <p class="text-sm text-justify lg:mr-10">Docente universitario en la categoría de Principal, con más de 23 años de experiencia 
                                            en investigación, gestión educacional y acreditación universitaria. Doctor en Ciencias de la Educación, Doctor en Psicología 
                                            Educacional y Tutorial, Doctor en Educación, Doctor en Administración de la Educación, Doctor en Sistemas de Ingeniería, DBA in 
                                            Business Administration, Ph.D. in Business Administration and Ph.D. in Scientific Research. Posdoctor en Ciencias de la Educación, 
                                            Posdoctor en Sistemas Diacrónicos y Sincrónicos de la Investigación Científica, y Posdoctor in Big Data. Experiencia en gestión de 
                                            proyectos, planificación estratégica, consecución de fondos concursables de cooperación técnica, organización de cursos y eventos 
                                            científicos y publicación en revistas especializadas nacionales y extranjeras. Experiencia como docente universitario a nivel de 
                                            pre y posgrado. Ponente en diversos eventos nacionales e internacionales. Ganador en la categoría de "Maestro" de las Palmas 
                                            Magisteriales del MINEDU, Conferencista internacional de la OIICE. Fluente en italiano, portugués e inglés. Ha sido Vicerrector 
                                            Académico en la Universidad Nacional Intercultural de la Amazonia de Ucayali y Vicerrector de Investigación en la Universidad Nacional 
                                            Autónoma de Chota - Cajamarca. Actual docente investigador en la Universidad Nacional Mayor de San Marcos y Universidad Nacional 
                                            de Cañete.</p>
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
                                <img class="object-center object-cover h-auto w-full" src={Vicente} alt="photo" />
                            </div>
                            <div class="text-center py-8 sm:py-6">
                                <p class="text-xl text-gray-700 font-bold mb-2">Dr. Wagner Vicente Ramos</p>
                                <p class="text-base text-gray-400 font-normal">Responsable de Tutoria Académica de la Facultad de Ingeniería</p>
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
                                <p class="text-base text-gray-400 font-normal">Responsable de Practicas Preprofesionales de la Facultad de Ingeniería</p>
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
                                <p class="text-xl text-gray-700 font-bold mb-2">Mg. Amanda Durán Carhuamaca</p>
                                <p class="text-base text-gray-400 font-normal">Director (e) de la Unidad de investigación de la Facultad de Ingeniería</p>
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
                                <p class="text-base text-gray-400 font-normal">Director (e) de la Unidad de Posgrado de la Facultad de Ingeniería</p>
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
                                <p class="text-base text-gray-400 font-normal">Director (e) de la Unidad de Innovación y Estudios Continuos de la Facultad de Ingeniería</p>
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
                                <p class="text-base text-gray-400 font-normal">Secretario Académico (e) de la Facultad de Ingeniería</p>
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
