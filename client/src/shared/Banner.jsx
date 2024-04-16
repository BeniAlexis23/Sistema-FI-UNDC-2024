// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../variants';

const Banner = ({ banner, heading, subheading }) => {
    return (
        <div className='gradientBg rounded-xl rounded-br-[80px] md:p-9 px-4 py-9'>
            <div className='flex flex-col md:flex-row-reverse justify-between items-center gap-10'>
                <motion.div
                    variants={fadeIn("down", 0.2)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: true, amount: 0.7 }}
                >
                    <img src={banner} alt="" className='lg:h-[386px]' />
                </motion.div>
                <motion.div
                    variants={fadeIn("left", 0.2)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: true, amount: 0.7 }}
                    className="md:w-3/5">
                    <h2 className='md:text-5xl text-4xl font-bold text-white mb-6 leading-relaxed'>{heading}</h2>
                    <p className='text-2xl text-justify text-white mt-6'>{subheading}</p>
                </motion.div>

            </div>
        </div>
    )
}
export default Banner
