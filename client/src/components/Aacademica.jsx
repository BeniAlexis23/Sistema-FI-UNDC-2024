import academica1 from '../assets/a-academica1.jpg'
import academica2 from '../assets/a-academica2.jpg'
import academica3 from '../assets/a-academica3.jpg'
// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../variants';

const Aacademica = () => {
    return (
        <div className="my-24 md:px-14 px-4 max-w-screen-2xl mx-auto" id='Aacademica'>
            <h2 className="md:text-5xl text-3xl font-extrabold mb-20 max-w-2xl mx-auto text-center">Actividades Académicas</h2>
            <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                {/*cards*/}
                <div className="w-full">
                    <div className='grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 items-start md:gap-12 gap-8'>
                        <motion.div
                            variants={fadeIn("up", 0.2)}
                            initial="hidden"
                            whileInView={"show"}
                            viewport={{ once: true, amount: 0.7 }}
                        >
                            <div className='bg-[rgba(255, 255, 255, 0.04)] rounded-[35px] h-96 shadow-3xl p-8 items-center flex justify-center hover:-translate-y-4 transition-all duration-300 cursor-pointer md:mt-16'>
                                <div>
                                    <img src={academica2} alt="" className='object-center object-cover h-auto w-full' />
                                    <h5 className='text-2xl font-semibold px-5 text-center mt-5'>Taller de Tesis</h5>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={fadeIn("up", 0.2)}
                            initial="hidden"
                            whileInView={"show"}
                            viewport={{ once: true, amount: 0.7 }}
                        >
                            <div className='bg-[rgba(255, 255, 255, 0.04)] rounded-[35px] h-96 shadow-3xl p-8 items-center flex justify-center hover:-translate-y-4 transition-all duration-300 cursor-pointer'>
                                <div>
                                    <img src={academica1} alt="" className='object-center object-cover h-auto w-full' />
                                    <h5 className='text-2xl font-semibold px-5 text-center mt-5'>Presentación de Productos Académicos</h5>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={fadeIn("up", 0.2)}
                            initial="hidden"
                            whileInView={"show"}
                            viewport={{ once: true, amount: 0.7 }}
                        >
                            <div className='bg-[rgba(255, 255, 255, 0.04)] rounded-[35px] h-96 shadow-3xl p-8 items-center flex justify-center hover:-translate-y-4 transition-all duration-300 cursor-pointer md:mt-16'>
                                <div>
                                    <img src={academica2} alt="" className='object-center object-cover h-auto w-full' />
                                    <h5 className='text-2xl font-semibold px-5 text-center mt-5'>Semillero de Investigación</h5>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={fadeIn("up", 0.2)}
                            initial="hidden"
                            whileInView={"show"}
                            viewport={{ once: true, amount: 0.7 }}
                        >
                            <div className='bg-[rgba(255, 255, 255, 0.04)] rounded-[35px] h-96 shadow-3xl p-8 items-center flex justify-center hover:-translate-y-4 transition-all duration-300 cursor-pointer'>
                                <div>
                                    <img src={academica3} alt="" className='object-center object-cover h-auto w-full' />
                                    <h5 className='text-2xl font-semibold px-5 text-center mt-5'>Reencunetro de Egresados</h5>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Aacademica
