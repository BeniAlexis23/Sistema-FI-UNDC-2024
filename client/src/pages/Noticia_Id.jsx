import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import { Link, useParams } from "react-router-dom";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { useEffect, useState } from "react";
import { getNoticiaRequest } from "../api/notices";

// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../variants';

const Noticia_Id = () => {
  const [noticia, setNoticia] = useState([]);
  const params = useParams();

  const getNoticia = async () => {
    try {
      const res = await getNoticiaRequest(params.id);
      setNoticia(res.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getNoticia();
  }, []);

  return (
    <>
      <Navbar />

      <div className="relative isolate overflow-hidden bg-white px-6 py-32 lg:overflow-visible lg:px-0">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <svg className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]" aria-hidden="true">
            <defs>
              <pattern id="e813992c-7d03-4cc4-a2bd-151760b470a0" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y="-1" className="overflow-visible fill-gray-50">
              <path d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z" strokeWidth="0" />
            </svg>
            <rect width="100%" height="100%" strokeWidth="0" fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
          </svg>
        </div>
        {/* Titulo */}
        <div className="container mx-auto max-w-screen-xl flex justify-center items-center px-6">
          <div className="w-full lg:max-w-7xl">
            <motion.div
              variants={fadeIn("right", 0.2)}
              initial="hidden"
              whileInView={"show"}
              viewport={{ once: true, amount: 0.7 }}
              className="w-full text-center"
            >
              <h2 className="text-1xl font-bold tracking-tight text-left text-gray-900 sm:text-2xl">{dayjs(noticia.date).utc().format("DD/MM/YYYY")}</h2>
              <h1 className="w-full mt-8 mb-8 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{noticia.title}</h1>
            </motion.div>
          </div>
        </div>
        {/* Descripcion */}
        <div className="flex justify-center items-center py-2 w-full">
          <div className="w-full max-w-screen-xl px-6 text-gray-600 md:px-12 xl:px-6">
            <div className="space-y-6 items-center lg:gap-12">
              <div className="w-full flex justify-center">
                <img src={noticia.imageUrl} alt="image" loading="lazy" className="w-full h-auto max-w-2xl object-cover rounded-md" />
              </div>
              <div className="mt-8">
                <motion.div
                  variants={fadeIn("up", 0.2)}
                  initial="hidden"
                  whileInView={"show"}
                  viewport={{ once: true, amount: 0.7 }}
                >
                  <div className="max-w-screen mx-auto mt-12">
                    <div className="text-gray-900 text-justify md:text-2xl">{noticia.description}</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        <div className="items-center flex justify-center mt-12">
          <Link to={"/noticias"} className="flex px-3 py-2 bg-primary hover:bg-secondary text-white font-semibold rounded hover:text-gray-300 cursor-pointer">
            <span>Ver Más</span>
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Noticia_Id;