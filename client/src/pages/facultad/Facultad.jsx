import Navbar from '../../components/Navbar';
import Footer from '../../shared/Footer';
import Almidon from '../../assets/c-almidon.png';

import banner1 from '../../assets/banner1.png';
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
                    <img src={Almidon} className="w-full relative z-10" alt="" />
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
                    <h1 className="font-bold text-3xl mb-5">Dr. Carlos Alcides Almidón Ortiz</h1>
                    <p className="text-sm text-justify lg:mr-10">Doctor en Sistemas de Ingeniería , Egresado Doctorado en Ingeniería de Sistemas,
                      Magister en Ingeniería de Sistemas, Ingeniero de Sistemas, Colegiado, Docente Posgrado, docente universitario, Instructor Cisco
                      CCNA, Especialista en comunicaciones, Consultor en comunicaciones con más de 15 años de experiencia (Supervisión, residencia, perfil,
                      expedientes técnicos en el área), Certificado de CCNA Ciberseguridad, Certificado en diseño e instalación de sistemas domóticos,
                      Certificado en diseño de Datacenter, Certificado en Instalación - Testing de Cableado Estructurado en Fibra y Cobre MMC, Curso
                      de Especialización de Gestión por procesos PUCP, Diplomado en configuración de servidores, Diplomado en Gerencia, Diplomado en
                      Didáctica Universitaria, Diplomado en Diseño y Gerencia de Proyectos de Inversión Pública, Diplomado en Modelamiento de Software,
                      Diplomado en Gestión Basado en Procesos, Diplomado en Investigación Formativa, especialista en diseño de infraestructura de
                      comunicaciones, seguridad e Informática con amplia trayectoria en consultoría en Tecnologías de Información y comunicación en
                      Instituciones Públicas y Privadas; capacitador en Tecnologías de Información y expositor de Temas relacionados Gestión de Procesos,
                      Tecnologías de información, Infraestructuras de comunicaciones.
                      Interpretación fluida de las normas legales en base a la lectura constante, como entretenimiento y capacitación. Exigente en el
                      cumplimiento oportuno de las obligaciones Institucionales, identificación plena con la institución donde presto servicios, asimismo
                      con la problemática de los mismos.</p>
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

export default Facultad
