import Navbar from '../../components/Navbar';
import Footer from '../../shared/Footer';
import Oseda from '../../assets/d-oseda.webp';

import banner1 from '../../assets/banner1.webp';
import Banner from '../../shared/Banner';
// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../../variants';

const Facultad = () => {
  return (
    <>
      <Navbar />
      <div className="md:px-14 p-4 mt-24 max-w-screen-2xl mx-auto" id='home'>
        <Banner banner={banner1} heading="UNDC - Facultad de Ingeniería" subheading="La Facultad de Ingeniería de la UNDC es un centro de excelencia dedicado a la formación de 
                profesionales altamente capacitados en diversas disciplinas ingenieriles. Con un enfoque innovador y orientado hacia la investigación, la facultad ofrece programas 
                académicos actualizados que preparan a los estudiantes para enfrentar los desafíos del mundo moderno. Nuestros docentes expertos y recursos tecnológicos de vanguardia 
                garantizan una educación de calidad que fomenta el pensamiento crítico, la creatividad y el liderazgo en el ámbito de la ingeniería." />
      </div>
      <section className=" mx-auto px-4 sm:px-6 lg:px-4 ">
        <motion.div
          variants={fadeIn("right", 0.2)}
          initial="hidden"
          whileInView={"show"}
          viewport={{ once: true, amount: 0.7 }}
        >
          <h1 className="mt-10 mb-4 font-bold text-3xl md:text-4xl lg:text-5xl text-center font-heading text-gray-900">
            Nuestras Autoridades
          </h1>
        </motion.div>
        {/*Dr Almidon*/}
        <div className="flex items-center mt-4 p-5 lg:p-5 overflow-hidden relative">
          <div className="w-full max-w-6xl rounded shadow-xl p-5 lg:p-5 mx-auto text-gray-800 relative md:text-left">
            <div className="md:flex items-center -mx-10">
              <div className="w-full md:w-1/2 px-10 mb-10 md:mb-0 lg:ml-2">
                <div className="relative">
                  <motion.div
                    variants={fadeIn("left", 0.2)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: true, amount: 0.7 }}
                  >
                    <img src={Oseda} className="w-full relative z-10" alt="" />
                  </motion.div>
                </div>
              </div>
              <div className="w-full md:w-1/2 px-10">
                <motion.div
                  variants={fadeIn("up", 0.2)}
                  initial="hidden"
                  whileInView={"show"}
                  viewport={{ once: true, amount: 0.7 }}
                >
                  <div className="mb-10">
                    <p className="font-bold text-2xl mb-5">Cordinador (e) de la Facultad de Ingeniería</p>
                    <h1 className="font-bold text-3xl mb-5">Ph.D. Dulio Oseda Gago</h1>
                    <p className="text-sm text-justify lg:mr-10">Docente universitario en la categoría de Principal, con más de 23 años de experiencia
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
      <Footer />
    </>
  )
}

export default Facultad;