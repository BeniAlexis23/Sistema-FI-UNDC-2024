import { motion } from "framer-motion";

import Navbar from "../../components/Navbar";
import Footer from "../../shared/Footer";
import Banner from "../../shared/Banner";
import Almidon from "../../assets/c-almidon.webp";
import banner1 from "../../assets/banner1.webp";
import { fadeIn } from "../../variants";

const Facultad = () => {
  return (
    <>
      <Navbar />

      <section
        className="mx-auto mt-24 max-w-screen-2xl px-4 md:px-14"
        id="home"
      >
        <Banner
          banner={banner1}
          eyebrow="Presentación institucional"
          heading="UNDC - Facultad de Ingeniería"
          subheading="La Facultad de Ingeniería de la UNDC es un espacio de formación orientado a la excelencia académica, la investigación y la innovación. Promovemos una educación sólida y actualizada que prepara profesionales capaces de responder a los retos del entorno tecnológico y contribuir activamente al desarrollo de la sociedad."
        />
      </section>

      <section className="mx-auto mb-20 mt-14 max-w-screen-2xl px-4 md:px-14">
        <motion.div
          variants={fadeIn("right", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
            Autoridad académica
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-[2.9rem] xl:text-[3.1rem]">
            Decanato de la Facultad de Ingeniería
          </h1>
        </motion.div>

        <motion.article
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_55px_rgba(15,23,42,0.08)]"
        >
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative bg-slate-100">
              <img
                src={Almidon}
                alt="Dr. Carlos Alcides Almidón Ortiz"
                className="h-[300px] w-full object-cover object-top sm:h-[360px] lg:h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
            </div>

            <div className="flex flex-col justify-center px-5 py-7 sm:px-8 lg:px-9 lg:py-8">
              <div className="mb-5 inline-flex w-fit items-center rounded-full bg-sky-50 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary">
                Decano de la Facultad de Ingeniería
              </div>

              <h2 className="text-[1.9rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.25rem]">
                Dr. Carlos Alcides Almidón Ortiz
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Doctor en Sistemas de Ingeniería, egresado del Doctorado en Ingeniería de Sistemas, Magíster en Ingeniería de Sistemas e Ingeniero de Sistemas colegiado. Cuenta con experiencia como docente de posgrado y docente universitario, así como formación especializada en infraestructura tecnológica, telecomunicaciones y gestión académica.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Su trayectoria incluye certificaciones y estudios en redes, ciberseguridad, domótica, diseño de datacenter, cableado estructurado, gestión por procesos, configuración de servidores, gerencia, didáctica universitaria, inversión pública, modelamiento de software e investigación formativa.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[0.98rem] sm:leading-7">
                Se desempeña además como consultor y capacitador en tecnologías de información, infraestructuras de comunicaciones, seguridad informática y gestión de procesos, con amplia experiencia en instituciones públicas y privadas.
              </p>
            </div>
          </div>
        </motion.article>
      </section>

      <Footer />
    </>
  );
};

export default Facultad;
