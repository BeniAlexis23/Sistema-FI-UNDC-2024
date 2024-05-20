import logo from '../assets/es-undc.png';
import { FaFacebookSquare } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";

const Footer = () => {
    return (
        <div className="bg-secondary md:px-14 p-4 max-w-screen-2xl mx-auto text-white">
            <div className='my-12 flex flex-col md:flex-row gap-10'>
                <div className='md:w-1/2 space-y-8'>
                    <a href="/" className='text-2xl font-semibold flex items-center space-x-3'>
                        <img src={logo} alt="" className='w-10 inline-block items-center' /> <span className='text-white'>UNDC-FI</span>
                    </a>
                    <p className='md:w-1/2 text-justify'>Los ingenieros resuelven problemas complejos y
                        desarrollan soluciones innovadoras para enfrentar desafíos en áreas como la tecnología, la salud, el medio ambiente y
                        la infraestructura. Su trabajo impulsa el progreso y mejora la calidad de vida en la sociedad.</p>
                </div>
                {/*footer navigation*/}
                <div className='md:w-1/2 flex flex-col md:flex-row flex-wrap justify-between gap-8 items-start'>
                    <div className='space-y-4 mt-5'>
                        <h4 className='text-xl'>Horarios</h4>
                        <ul className='space-y-3'>
                            <a className='block hover:text-gray-300'>8:00 AM - 1:00 PM</a>
                            <a className='block hover:text-gray-300'>2:00 PM - 5:00 PM</a>
                            <a className='block hover:text-gray-300'>LUNES - VIERNES</a>
                        </ul>
                    </div>
                    <div className='space-y-4 mt-5'>
                        <h4 className='text-xl'>Plataformas</h4>
                        <ul className='space-y-3'>
                            <a href="https://portal.undc.edu.pe/" target="_blank" className='block hover:text-gray-300'>Portal UNDC</a>
                            <a href="https://www.undc.edu.pe/idiomas/" target="_blank" className='block hover:text-gray-300'>Centro de Idiomas</a>
                            <a href="https://posgrado.undc.edu.pe/" target="_blank" className='block hover:text-gray-300'>Posgrado UNDC</a>
                            <a href="https://admision.undc.edu.pe/" target="_blank" className='block hover:text-gray-300'>Admisión</a>
                        </ul>
                    </div>
                    <div className='space-y-4 mt-5'>
                        <h4 className='text-xl'>Contactos</h4>
                        <ul className='space-y-3'>
                            <p className='hover:text-gray-300'>+51 949026908</p>
                            <p className='hover:text-gray-300'>Av. Mariscal Benavides</p>
                            <p className='hover:text-gray-300'>N° 322</p>
                            <p className='hover:text-gray-300'>San Vicente - Cañete</p>
                        </ul>
                    </div>
                </div>
            </div>
            <hr />
            <div className='flex flex-col sm:flex-row gap-8 sm:items-center justify-between my-8'>
                <p>Facultad de Ingeniería - {/*<a href="https://github.com/BeniAlexis23" target='_blank'>@BeniAlexis23</a>*/} 2024. All right reserved.</p>
                <div className='flex items-center space-x-5'>
                    <a href='https://www.facebook.com/FIUNDC' target="_blank"><FaFacebookSquare className='w-8 cursor-pointer hover:-translate-y-4 transition-all duration-300 size-8' /></a>
                    <FaInstagramSquare className='w-8 cursor-pointer hover:-translate-y-4 transition-all duration-300 size-8' />
                    <FaLinkedin className='w-8 cursor-pointer hover:-translate-y-4 transition-all duration-300 size-8' />
                </div>
            </div>
        </div>
    )
}

export default Footer
