import { motion } from 'framer-motion';

import { fadeIn } from '../variants';

const Banner = ({ banner, heading, subheading, eyebrow }) => {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-500 via-primary to-blue-700 shadow-[0_24px_60px_rgba(16,129,234,0.22)]">
      <div className="grid items-center gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:px-12 lg:py-12">
        <motion.div
          variants={fadeIn('left', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="order-2 lg:order-1"
        >
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/75 sm:text-sm">
              {eyebrow}
            </p>
          )}

          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.85rem]">
            {heading}
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white sm:text-base sm:leading-8 lg:text-lg">
            {subheading}
          </p>
        </motion.div>

        <motion.div
          variants={fadeIn('down', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="order-1 lg:order-2"
        >
          <div className="relative mx-auto w-full max-w-[640px] overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/10 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-sm">
            <img
              src={banner}
              alt={heading}
              className="h-[220px] w-full object-cover object-center sm:h-[280px] lg:h-[360px]"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Banner;
