import { useEffect, useState, useMemo } from "react";
import { getUIDecretosRequest } from "../api/ui-decretos";
import { FaFileDownload } from "react-icons/fa";

import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';
import Duran from '../assets/a-duran.webp';

import { Link } from "react-router-dom";
// motion
import { motion } from 'framer-motion';
// variants
import { fadeIn } from '../variants';

const Investigacion = () => {

    const [decretos, setDecretos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("2025");
    const [error, setError] = useState(null);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const filteredDecretos = useMemo(() => {
        return decretos.filter((decreto) => {
            const decretoYear = new Date(decreto.date).getFullYear().toString();
            return (
                (decreto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    decreto.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (selectedYear === "" || decretoYear === selectedYear)
            );
        });
    }, [decretos, searchTerm, selectedYear]);

    const getDecretos = async () => {
        try {
            const res = await getUIDecretosRequest();
            setDecretos(res.data);
        } catch (error) {
            setError("Error al cargar los decretos. Por favor, inténtalo de nuevo más tarde.");
            console.log(error);
        }
    }

    useEffect(() => {
        getDecretos();
    }, []);

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
                        Unidad de Investigación de la Facultad de Ingeniería
                    </h1>
                </motion.div>
                {/*Dr Almidon*/}
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
                                        <img src={Duran} class="w-full relative z-10" alt="" />
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
                                        <p class="font-bold text-2xl mb-5">Director (e) de la Unidad de Investigación de la Facultad de Ingeniería</p>
                                        <h1 className="font-bold text-3xl mb-5">Dra. Amanda Duran Carhuamaca</h1>
                                        <p class="text-sm text-justify lg:mr-10">Profesional encauzada en alcanzar objetivos con base en el uso de tecnología. Magister en Informática de
                                            la Pontificia Universidad Católica del Perú, Ingeniera de Sistemas, candidata a Doctora en Ingeniería de Sistemas, Doctorado en Docencia Universitaria.
                                            Con experiencia en la gestión y dirección de proyectos en diferentes organizaciones. Analista Funcional de proyectos de software. Experiencia en
                                            docencia universitaria (13 años). Directora de la EAP de Ingeniería de Sistemas. Docente- investigadora en más de 10 de universidades. Expositora
                                            de temas de vanguardia en investigación y tecnología.</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*Lista de Decretos
                <div className="bg-white p-8 rounded-md w-full">
                    <div className="flex items-center justify-between pb-6">
                        <div>
                            <motion.div
                                variants={fadeIn("right", 0.2)}
                                initial="hidden"
                                whileInView={"show"}
                                viewport={{ once: true, amount: 0.7 }}
                            >
                                <h1 className="font-semibold text-2xl">Decretos de la Unidad de Investigación de la FI</h1>
                            </motion.div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex bg-gray-50 items-center p-2 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fillRule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clipRule="evenodd" />
                                </svg>
                                <input className="bg-gray-50 outline-none ml-1 block " type="text" name="" id="" placeholder="buscar..." value={searchTerm} onChange={handleSearchChange} />
                            </div>
                        </div>
                    </div>
                    {error && <div className="text-red-500">{error}</div>}
                    <motion.div
                        variants={fadeIn("up", 0.2)}
                        initial="hidden"
                        whileInView={"show"}
                        viewport={{ once: true, amount: 0.7 }}
                    >
                        <div>
                            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                                <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                                    <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row">
                                        <h2>Selecciona el año:</h2>
                                        <div className="inline-flex mt-2 xs:mt-0">
                                            <select className="text-sm text-gray-900" onChange={handleYearChange} value={selectedYear}>
                                                <option value="2025">2025</option>
                                                <option value="2024">2024</option>
                                                <option value="2023">2023</option>
                                            </select>
                                        </div>
                                    </div>
                                    <table className="min-w-full leading-normal">
                                        <thead>
                                            <tr>
                                                <th
                                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    N°
                                                </th>
                                                <th
                                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Decreto
                                                </th>
                                                <th
                                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Contenido
                                                </th>
                                                <th
                                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider flex justify-center items-center">
                                                    Descarga
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                filteredDecretos.map((decreto, index) => (
                                                    <tr key={decreto._id}>
                                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                            <p className="text-gray-900 whitespace-no-wrap">{index + 1}</p>
                                                        </td>
                                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                            <p className="text-gray-900 whitespace-no-wrap">{decreto.title}</p>
                                                        </td>
                                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                            <p className="text-gray-900 whitespace-no-wrap">
                                                                {decreto.description}
                                                            </p>
                                                        </td>
                                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-center">
                                                            <Link to={decreto.url} target="_blank" className="flex justify-center items-center text-3xl"><FaFileDownload /></Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div> */}

            </section>
            <Footer />
        </>
    )
}

export default Investigacion
