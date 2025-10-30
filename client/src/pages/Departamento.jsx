import Navbar from "../components/Navbar";
import Footer from "../shared/Footer";

import Oseda from "../assets/d-oseda.webp";
import Vicente from "../assets/w-vicente.webp";
import Almidon from "../assets/c-almidon.webp";
import Roque from "../assets/e-roque.webp";
import Duran from "../assets/a-duran.webp";
import Pacheco from "../assets/a-pacheco.webp";
import Angoma from "../assets/m-angoma.webp";
import Ferreyros from "../assets/j-ferreyros.webp";
import Larico from "../assets/g-larico.webp";
import Asto from "../assets/l-asto.webp";
import Aranguena from "../assets/m-aranguena.webp";
import Huancahuire from "../assets/c-huancahuire.webp";
import Cardenas from "../assets/c-cardenas.webp";
import Daga from "../assets/m-daga.webp";
import Hernandez from "../assets/j-hernandez.webp";
import Reynoso from "../assets/j-reynoso.webp";
import Vilca from "../assets/j-vilca.webp";

// motion
import { motion } from "framer-motion";
// variants
import { fadeIn } from "../variants";

const Departamento = () => {
  const docentes = [
    {
      id: 1,
      nombre: "Ph.D. Dulio Oseda Gago",
      condicion: "Docente Principal",
      foto: Oseda,
    },
    {
      id: 2,
      nombre: "Dr. Guido Larico Uchamaco",
      condicion: "Docente Principal",
      foto: Larico,
    },
    {
      id: 3,
      nombre: "Dr. Wagner Vicente Ramos",
      condicion: "Docente Principal",
      foto: Vicente,
    },
    {
      id: 4,
      nombre: "Dr. Carlos Almidon Ortiz",
      condicion: "Docente Principal",
      foto: Almidon,
    },
    {
      id: 5,
      nombre: "Dr. Edwin Roque Tito",
      condicion: "Docente Principal",
      foto: Roque,
    },
    {
      id: 6,
      nombre: "Mg. Alex Pacheco Pumaleque",
      condicion: "Docente Asociado",
      foto: Pacheco,
    },
    {
      id: 7,
      nombre: "Dra. Amanda Durán Carhuamaca",
      condicion: "Docente Asociado",
      foto: Duran,
    },
    {
      id: 8,
      nombre: "Dra. Marisol Daga Chaca",
      condicion: "Docente Asociado",
      foto: Daga,
    },
    {
      id: 9,
      nombre: "M.Sc. Leonidas Asto Huamán",
      condicion: "Docente Auxiliar",
      foto: Asto,
    },
    {
      id: 10,
      nombre: "Dra. Miriam Angoma Astucuri",
      condicion: "Docente Auxiliar",
      foto: Angoma,
    },
    {
      id: 11,
      nombre: "Dr. Jair Ferreyros Yucra",
      condicion: "Docente Auxiliar",
      foto: Ferreyros,
    },
    {
      id: 12,
      nombre: "M.Sc. Magaly Arangüena Yllanes",
      condicion: "Docente Auxiliar",
      foto: Aranguena,
    },
    {
      id: 13,
      nombre: "M.Sc. Claudio Huancahuire Bravo",
      condicion: "Docente Auxiliar",
      foto: Huancahuire,
    },
    {
      id: 14,
      nombre: "Mg. Cesar Cárdenas Lino",
      condicion: "Docente Auxiliar",
      foto: Cardenas,
    },
    {
      id: 15,
      nombre: "Mg. Juan Hernández Péves",
      condicion: "Docente Auxiliar",
      foto: Hernandez,
    },
    {
      id: 16,
      nombre: "MBA Jenny Reynoso Palpa",
      condicion: "Docente Auxiliar",
      foto: Reynoso,
    },
    {
      id: 17,
      nombre: "Mg. Joel Vilca Pizarro",
      condicion: "Docente Auxiliar",
      foto: Vilca,
    },
  ];

  return (
    <>
      <Navbar />
      <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
        <motion.div
          variants={fadeIn("right", 0.2)}
          initial="hidden"
          whileInView={"show"}
          viewport={{ once: true, amount: 0.7 }}
        >
          <h1 class="mt-24 mb-4 font-bold text-3xl md:text-4xl lg:text-5xl text-center font-heading text-gray-900">
            Departamento Académico de Ingeniería de Sistemas
          </h1>
        </motion.div>
        {/*Dr Roque*/}
        <div class="flex items-center -mt-4 p-5 lg:p-5 overflow-hidden relative">
          <div class="w-full max-w-6xl rounded shadow-xl p-5 lg:p-5 mx-auto text-gray-800 relative md:text-left">
            <div class="md:flex items-center -mx-10">
              <div class="w-full md:w-1/2 px-10 mb-10 md:mb-0 lg:ml-2">
                <div class="relative">
                  <motion.div
                    variants={fadeIn("left", 0.2)}
                    initial="hidden"
                    whileInView={"show"}
                    viewport={{ once: true, amount: 0.7 }}
                  >
                    <img src={Asto} class="w-full relative z-10" alt="" />
                  </motion.div>
                </div>
              </div>
              <div class="w-full md:w-1/2 px-10">
                <motion.div
                  variants={fadeIn("up", 0.2)}
                  initial="hidden"
                  whileInView={"show"}
                  viewport={{ once: true, amount: 0.7 }}
                >
                  <div class="mb-10">
                    <p class="font-bold text-2xl mb-5">
                      Director (e) del Departamento Académico de Ingenieria de
                      Sistemas
                    </p>
                    <h1 className="font-bold text-3xl mb-5">
                      M.Sc. Leonidas Asto Huamán
                    </h1>
                    <p class="text-sm text-justify lg:mr-10">
                      De profesión, Ingeniero Informático y Sistemas con
                      maestría en Informática, candidato a doctor en Ingeniería
                      de Sistemas. Docente, con experiencia en universidades
                      públicas y privadas. Asesor de tesis. Áreas de
                      investigación: Machine Learning, Redes Neuronales,
                      Interacción Humano Computador, IoT, Sistemas Inteligentes,
                      Procesamiento Natural y BI. Con capacidad analizar,
                      diseñar, construir, evaluar, diagnosticar, auditar y
                      mantener sistemas informáticos aplicados en las diferentes
                      áreas del conocimiento. Dedicado a la Administración de
                      Sistemas GNU/Linux.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*Plana Docentes*/}
      <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-12">
        <div class="text-center pb-12">
          <h1 class="font-bold text-3xl md:text-4xl lg:text-5xl font-heading text-gray-900">
            Docentes Ordinarios
          </h1>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docentes.map((docente) => (
            <motion.div
              key={docente.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.7 }}
            >
              <div class="w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                <div>
                  <img
                    class="object-center object-cover h-auto w-full"
                    src={docente.foto}
                    alt={docente.nombre}
                  />
                </div>
                <div class="text-center py-8 sm:py-6">
                  <p class="text-xl text-gray-700 font-bold mb-2">
                    {docente.nombre}
                  </p>
                  <p class="text-base text-gray-400 font-normal">
                    {docente.condicion}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Departamento;
