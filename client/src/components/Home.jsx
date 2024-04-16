import { useState, useEffect } from 'react';
import banner1 from '../assets/banner1.jpg';
import banner2 from '../assets/banner2.jpeg';
import banner3 from '../assets/banner3.jpg';
import banner4 from '../assets/banner4.jpeg';
import banner5 from '../assets/banner5.jpg';
import Banner from '../shared/Banner';
import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';
import { RxDotFilled } from 'react-icons/rx';
// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../variants';

const Home = () => {

    const sliders = [
        {
            url: `${banner1}`,
        },
        {
            url: `${banner2}`,
        },
        {
            url: `${banner3}`,
        },
        {
            url: `${banner4}`,
        },
        {
            url: `${banner5}`,
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0)

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? sliders.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    }

    const nextSlide = () => {
        const isLastSlide = currentIndex === sliders.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex)
    }

    useEffect(() => {
        const intervalId = setInterval(nextSlide, 5000);
        return () => clearInterval(intervalId);
    }, [currentIndex]);

    return (
        <>
            {/*Carousel*/}
            <motion.div
                variants={fadeIn("right", 0.2)}
                initial="hidden"
                whileInView={"show"}
                viewport={{ once: true, amount: 0.7 }}
            >
                <div className='max-w-[1400px] h-[790px] w-full m-auto py-28 px-4 relative group'>
                    <div style={{ backgroundImage: `url(${sliders[currentIndex].url})` }} className='w-full h-full rounded-2xl bg-center bg-cover duration-500'>
                    </div>
                    {/*Left Arrow*/}
                    <div className='hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full bg-black/20 text-white cursor-pointer'>
                        <BsChevronCompactLeft onClick={prevSlide} size={30} />
                    </div>
                    {/*Right Arrow*/}
                    <div className='hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full bg-black/20 text-white cursor-pointer'>
                        <BsChevronCompactRight onClick={nextSlide} size={30} />
                    </div>
                    <div className='flex top-4 justify-center py-2'>
                        {sliders.map((slide, slideIndex) => (
                            <div key={slideIndex} onClick={() => goToSlide(slideIndex)} className='text-2xl cursor-pointer'>
                                <RxDotFilled />
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
            <div className="md:px-14 p-4 -mt-10 max-w-screen-2xl mx-auto" id='home'>
                <Banner banner={banner1} heading="UNDC - Facultad de Ingeniería" subheading="La Facultad de Ingeniería de la UNDC es un centro de excelencia dedicado a la formación de 
                profesionales altamente capacitados en diversas disciplinas ingenieriles. Con un enfoque innovador y orientado hacia la investigación, la facultad ofrece programas 
                académicos actualizados que preparan a los estudiantes para enfrentar los desafíos del mundo moderno. Nuestros docentes expertos y recursos tecnológicos de vanguardia 
                garantizan una educación de calidad que fomenta el pensamiento crítico, la creatividad y el liderazgo en el ámbito de la ingeniería." />
            </div>
        </>
    )
}

export default Home
