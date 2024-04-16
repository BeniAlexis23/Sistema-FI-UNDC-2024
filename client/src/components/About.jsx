import aboutImg from '../assets/aboutImg.jpg'
import aboutImg2 from '../assets/aboutImg2.jpg'

// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../variants';

const About = () => {
    return (
        <div className="md:px-14 p-4 max-w-screen-2xl mx-auto space-y-10" id='about'>
            <h2 className="md:text-5xl text-3xl font-extrabold mb-20 max-w-2xl mx-auto text-center">Sección de Noticias de la Facultad de Ingeniería</h2>
            <div className='flex flex-col md:flex-row justify-between items-center gap-8'>
                <motion.div
                    variants={fadeIn("right", 0.3)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: true, amount: 0.7 }}
                    className='md:w-1/2'>
                    <img src={aboutImg} alt="" />
                </motion.div>
                {/*Content*/}
                <motion.div
                    variants={fadeIn("left", 0.3)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: true, amount: 0.7 }}
                    className='md:w-2/5 lg:mr-16'>
                    <h2 className='md:text-5xl text-3xl font-bold mb-5 leading-normal'>Ponencia de Nuestros Egresados - 2023</h2>
                    <p className='text-justify text-lg mb-7'>Los egresados comparten sus trayectorias profesionales, destacando proyectos 
                    relevantes en los que han participado y el impacto de su trabajo en el ámbito laboral. Además, presentan los resultados 
                    de sus investigaciones y desarrollos de tesis, resaltando la aplicación práctica de los conocimientos adquiridos durante 
                    su formación académica. Estas ponencias ofrecen una visión integral de las habilidades y capacidades que los egresados 
                    de la carrera de Ingeniería de Sistemas de la UNDC poseen para enfrentar los desafíos del mercado laboral actual.</p>
                </motion.div>
            </div>
            {/*2da part*/}
            <div className='flex flex-col md:flex-row-reverse justify-between items-center gap-8'>
                <motion.div
                    variants={fadeIn("up", 0.3)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: true, amount: 0.7 }}
                    className='md:w-1/2'>
                    <img src={aboutImg2} alt="" />
                </motion.div>
                {/*Content*/}
                <motion.div
                    variants={fadeIn("right", 0.3)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: true, amount: 0.7 }}
                    className='md:w-2/5 lg:ml-16'>
                    <h2 className='md:text-5xl text-3xl font-bold mb-5 leading-normal'>V CIISIC - 2023</h2>
                    <p className='text-tartiary text-justify text-lg mb-7'>El “V CONGRESO INTERNACIONAL DE INGENIERÍA DE SISTEMAS E INVESTIGACÓN CIENTÍFICA”,
                        cuyo eje principal gira entorno a la interrogante ¿Cómo se aplican los métodos y técnicas de la Ingeniería de Sistemas en la
                        Transformación Digital de las organizaciones? ¿Cómo potenciar las investigaciones científicas en el pre y post grado peruano
                        en función a las tecnologías de información y comunicación?, es un aporte fundamental en la diseminación de información y
                        conocimiento sobre el cómo hacer la investigación científica y no morir en el intento.</p>
                </motion.div>
            </div>

            

        </div>
    )
}

export default About
