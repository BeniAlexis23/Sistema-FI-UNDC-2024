import { motion } from 'framer-motion';

import HeroCarousel, { HERO_HEIGHT } from '../cms/hero/HeroCarousel';
import { useHeroSlides } from '../cms/hero/useHeroSlides';
import { fadeIn } from '../variants';

const Home = () => {
  const { source, slides, intervalSeconds } = useHeroSlides();

  return (
    <motion.section
      variants={fadeIn('right', 0.2)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="mx-auto w-full max-w-screen-2xl px-4 pt-24 sm:px-6 lg:px-8 lg:pt-28"
    >
      {source === 'loading' ? (
        <div className={`${HERO_HEIGHT} animate-pulse rounded-[1.75rem] bg-slate-200`} aria-hidden="true" />
      ) : (
        // al cambiar la lista (por ejemplo, tras actualizar en segundo plano) el carrusel se arma de nuevo
        <HeroCarousel key={slides.map((slide) => slide.id).join('|')} slides={slides} intervalSeconds={intervalSeconds} />
      )}
    </motion.section>
  );
};

export default Home;
