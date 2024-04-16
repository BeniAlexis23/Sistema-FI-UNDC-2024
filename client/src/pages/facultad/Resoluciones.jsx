import { useEffect, useState } from "react";
import { getResolucionesRequest } from "../../api/rcfs";

import { FaFileDownload } from "react-icons/fa";

import Navbar from '../../components/Navbar';
import Footer from '../../shared/Footer';
import { Link } from "react-router-dom";

const Resoluciones = () => {

    const [resoluciones, setResoluciones] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("2024");

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };


    const filteredResoluciones = resoluciones.filter((rcf) => {
        const rcfYear = new Date(rcf.date).getFullYear().toString();
        return (
            (rcf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rcf.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedYear === "" || rcfYear === selectedYear)
        );
    });

    const getResoluciones = async () => {
        try {
            const res = await getResolucionesRequest();
            setResoluciones(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getResoluciones();
    }, []);


    return (
        <>
            <Navbar />
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-4 py-24">
                <div className="bg-white p-8 rounded-md w-full">
                    <div className=" flex items-center justify-between pb-6">
                        <div>
                            <h1 className="font-semibold text-2xl">Resoluciones de Coordinación de Facultad</h1>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex bg-gray-50 items-center p-2 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clip-rule="evenodd" />
                                </svg>
                                <input className="bg-gray-50 outline-none ml-1 block " type="text" name="" id="" placeholder="buscar..." value={searchTerm} onChange={handleSearchChange} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                            <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                                <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row">
                                    <h2>Selecciona el año:</h2>
                                    <div className="inline-flex mt-2 xs:mt-0">
                                        <select className="text-sm text-gray-900" onChange={handleYearChange} value={selectedYear}>
                                            <option value="2024">2024</option>
                                            <option value="2023">2023</option>
                                            {/* Agrega más opciones según necesites */}
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
                                                Resolución
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
                                            filteredResoluciones.map((rcf, index) => (
                                                <>
                                                    <tr key={rcf._id}>
                                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                            <p class="text-gray-900 whitespace-no-wrap">{index + 1}</p>
                                                        </td>
                                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                            <p class="text-gray-900 whitespace-no-wrap">{rcf.title}</p>
                                                        </td>
                                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                            <p className="text-gray-900 whitespace-no-wrap">
                                                                {rcf.description}
                                                            </p>
                                                        </td>
                                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-center">
                                                            <Link to={rcf.url} target="_blank" className="flex justify-center items-center text-3xl"><FaFileDownload /></Link>
                                                        </td>
                                                    </tr>
                                                </>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}

export default Resoluciones;