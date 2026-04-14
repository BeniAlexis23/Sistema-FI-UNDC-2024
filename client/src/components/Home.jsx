import { useEffect, useState } from 'react';
import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';
import { RxDotFilled } from 'react-icons/rx';
import { motion } from 'framer-motion';

import banner1 from '../assets/banner1.webp';
import banner2 from '../assets/banner2.webp';
import banner3 from '../assets/banner3.webp';
import banner4 from '../assets/banner4.webp';
import banner5 from '../assets/banner5.webp';
import { fadeIn } from '../variants';

const sliders = [
  { url: banner1, alt: 'Banner institucional 1' },
  { url: banner2, alt: 'Banner institucional 2' },
  { url: banner3, alt: 'Banner institucional 3' },
  { url: banner4, alt: 'Banner institucional 4' },
  { url: banner5, alt: 'Banner institucional 5' },
];

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((current) => (current === 0 ? sliders.length - 1 : current - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((current) => (current === sliders.length - 1 ? 0 : current + 1));
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((current) => (current === sliders.length - 1 ? 0 : current + 1));
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <motion.section
      variants={fadeIn('right', 0.2)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="mx-auto w-full max-w-screen-2xl px-4 pt-24 sm:px-6 lg:px-8 lg:pt-28"
    >
      <div className="group relative overflow-hidden rounded-[1.75rem] bg-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
        <div className="relative h-[300px] sm:h-[360px] md:h-[420px] lg:h-[500px] xl:h-[560px] 2xl:h-[620px]">
          <img
            src={sliders[currentIndex].url}
            alt={sliders[currentIndex].alt}
            className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-slate-950/10" />

          <button
            type="button"
            onClick={prevSlide}
            aria-label="Banner anterior"
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/35 p-3 text-white transition hover:bg-black/55 lg:flex"
          >
            <BsChevronCompactLeft size={26} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Banner siguiente"
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/35 p-3 text-white transition hover:bg-black/55 lg:flex"
          >
            <BsChevronCompactRight size={26} />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm sm:bottom-5">
            {sliders.map((slide, slideIndex) => (
              <button
                key={slide.alt}
                type="button"
                onClick={() => goToSlide(slideIndex)}
                aria-label={`Ir al banner ${slideIndex + 1}`}
                className={`text-xl transition sm:text-2xl ${
                  slideIndex === currentIndex ? 'text-white' : 'text-white/45 hover:text-white/80'
                }`}
              >
                <RxDotFilled />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Home;
