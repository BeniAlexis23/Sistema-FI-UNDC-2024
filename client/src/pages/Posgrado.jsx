import Navbar from '../components/Navbar'
import Footer from '../shared/Footer'
import Angoma from '../assets/m-angoma.png'
// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../variants';

const Posgrado = () => {
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
            Unidad de Posgrado de la Facultad de Ingeniería
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
                    <img src={Angoma} class="w-full relative z-10" alt="" />
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
                    <p class="font-bold text-2xl mb-5">Director (e) de la Unidad de Posgrado de la Facultad de Ingeniería</p>
                    <h1 className="font-bold text-3xl mb-5">Dra. Miriam Angoma Astucuri</h1>
                    <p class="text-sm text-justify lg:mr-10">Docente universitaria de la Universidad Peruana los Andes Sede la Merced, coordinadora de Asuntos 
                    Académicos del periodo académico 2010-I al 2016-II, Responsable de investigación en el periodo Académico 2017-I y responsable de posgrado durante 
                    el periodo 2017-II; docente universitario en la Universidad Nacional de Huancavelica en la Escuela Profesional de Ingeniería de Sistemas en el 
                    periodo académico 2018-I y 2018-II, jefa del área de producción de la Escuela Profesional de Ingeniería de Sistemas. Doctora en Sistemas de 
                    Ingeniería de la Universidad Nacional de Centro del Perú, Magister en Administración, mención : Gestión de Proyectos de la Universidad Nacional 
                    del Centro, Egresada de la segunda especialización en didáctica universitaria de la Universidad Peruana Los Andes, Egresada de la maestría en 
                    docencia universitaria de la Universidad Peruana Los Andes.</p>
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

export default Posgrado