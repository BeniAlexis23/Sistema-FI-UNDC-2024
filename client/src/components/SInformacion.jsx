import { FaAddressBook } from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { ImBooks } from "react-icons/im";
import { FaGraduationCap } from "react-icons/fa";
import { AiOutlineDeliveredProcedure } from "react-icons/ai";
import { GrLanguage } from "react-icons/gr";

const SInformacion = () => {

    return (
        <section className="relative bg-white sm:py-12 lg:py-12 lg:pt-12">

            <div className="mb-12 md:px-14 px-4 max-w-screen-2xl mx-auto">
                <div>
                    <h2 className="md:text-5xl text-3xl font-extrabold mb-20">SISTEMAS DE INFORMACIÓN</h2>
                </div>

                <div className="grid items-center max-w-7xl grid-cols-2 gap-4 mx-auto mt-12 md:mt-20 md:grid-cols-3">
                    <a className="bg-primary text-white transition-all duration-300 rounded hover:bg-secondary h-12 lg:text-lg text-sm flex shadow-lg items-center justify-center hover:text-gray-300 cursor-pointer" href="https://sivireno.undc.edu.pe/" target="_blank" >
                        <FaAddressBook />&nbsp;<span>SIVIRENO</span>
                    </a>
                    <a className="bg-primary text-white transition-all duration-300 rounded hover:bg-secondary h-12 lg:text-lg text-sm flex shadow-lg items-center justify-center hover:text-gray-300 cursor-pointer" href="https://aula.undc.edu.pe/" target="_blank" >
                        <SiGoogleclassroom />&nbsp;<span>AULA VIRTUAL</span>
                    </a>
                    <a className="bg-primary text-white transition-all duration-300 rounded hover:bg-secondary h-12 lg:text-lg text-sm flex shadow-lg items-center justify-center hover:text-gray-300 cursor-pointer" href="https://biblioteca.undc.edu.pe/" target="_blank" >
                        <ImBooks />&nbsp;<span>BIBLIOTECA</span>
                    </a>
                    <a className="bg-primary text-white transition-all duration-300 rounded hover:bg-secondary h-12 lg:text-lg text-sm flex shadow-lg items-center justify-center hover:text-gray-300 cursor-pointer" href="https://repositorio.undc.edu.pe/" target="_blank" >
                        <FaGraduationCap />&nbsp;<span>REPOSITORIO UNDC</span>
                    </a>
                    <a className="bg-primary text-white transition-all duration-300 rounded hover:bg-secondary h-12 lg:text-lg text-sm flex shadow-lg items-center justify-center hover:text-gray-300 cursor-pointer" href="https://tramite.undc.edu.pe/" target="_blank" >
                        <AiOutlineDeliveredProcedure />&nbsp;<span>TRAMITE DOCUMENTARIO</span>
                    </a>
                    <a className="bg-primary text-white transition-all duration-300 rounded hover:bg-secondary h-12 lg:text-lg text-sm flex shadow-lg items-center justify-center hover:text-gray-300 cursor-pointer" href="https://vri.undc.edu.pe/gedipi/" target="_blank" >
                        <GrLanguage />&nbsp;<span>GEDIPI</span>
                    </a>
                </div>
            </div>
        </section>
    )
}

export default SInformacion
