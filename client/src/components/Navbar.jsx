import { useState } from 'react';
import logo from '../assets/es-undc.png';
import logo2 from '../assets/logo-fi.png';
import { FaXmark, FaBars } from "react-icons/fa6";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFacultadOpen, setIsFacultadOpen] = useState(false); // Nueva variable de estado para facultad
  const [isEscuelaOpen, setIsEscuelaOpen] = useState(false); // Nueva variable de estado para escuela
  const [isEventosOpen, setIsEventosOpen] = useState(false); // Nueva variable de estado para escuela

  const toggleFacultad = () => {
    setIsFacultadOpen(!isFacultadOpen);
    setIsEscuelaOpen(false); // Cerrar el menú de escuela si está abierto
    setIsEventosOpen(false); // Cerrar el menú de eventos si está abierto
  };

  const toggleEscuela = () => {
    setIsEscuelaOpen(!isEscuelaOpen);
    setIsFacultadOpen(false); // Cerrar el menú de facultad si está abierto
    setIsEventosOpen(false); // Cerrar el menú de eventos si está abierto
  };

  const toggleEventos = () => {
    setIsEventosOpen(!isEventosOpen);
    setIsFacultadOpen(false); // Cerrar el menú de facultad si está abierto
    setIsEscuelaOpen(false);  // Cerrar el menú de escuela si está abierto
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className='bg-white md:px-14 p-4 max-w-screen-2xl border-b mx-auto fixed top-0 right-0 left-0'>
        <div className='text-lg container mx-auto flex justify-between items-center font-medium'>
          <div className='flex space-x-14 items-center'>
            <a href="/" className='text-2xl font-semibold flex items-center space-x-3'>
              <img src={logo} alt="" className='w-10 inline-block items-center' />
              <img src={logo2} alt="" className='w-10 inline-block items-center' />
              <span>FI - UNDC</span>
            </a>
            <ul className='md:flex space-x-12 hidden'>
              <li>
                <span className="relative">
                  <button onClick={toggleFacultad} className="focus:outline-none">
                    Facultad {isFacultadOpen ? <FaAngleUp className="inline-block" /> : <FaAngleDown className="inline-block" />}
                  </button>
                  {isFacultadOpen && (
                    <ul className="absolute left-0 pl-4 mt-2 w-40 bg-white shadow-lg rounded-md p-2 border border-zinc-200 flex flex-col gap-2">
                      <li className="border-b border-gray-200 py-1"><Link to={"/facultad"}>Nosotros</Link></li>
                      <li className="border-b border-gray-200 py-1"><Link to={"/facultad/resoluciones"}>Resoluciones</Link></li>
                    </ul>
                  )}
                </span>
              </li>
              <li><Link to={"/departamento"}>Departamento</Link></li>
              <li>
                <span className="relative">
                  <button onClick={toggleEscuela} className="focus:outline-none">
                    Escuelas {isEscuelaOpen ? <FaAngleUp className="inline-block" /> : <FaAngleDown className="inline-block" />}
                  </button>
                  {isEscuelaOpen && (
                    <ul className="absolute left-0 pl-4 mt-2 w-40 bg-white shadow-lg rounded-md p-2 border border-zinc-200 flex flex-col gap-2">
                      <li className="border-b border-gray-200 py-1"><Link to={"/escuela"}>Ingeniería de Sistemas</Link></li>
                      <li className="border-b border-gray-200 py-1"><Link to={"https://tutoria.undc.edu.pe/Login/index.php"} target='_blank'>Tutoria</Link></li>
                      <li className="border-b border-gray-200 py-1"><Link to={"https://portal.undc.edu.pe/proyeccionsocial/"} target='_blank'>RSU</Link></li>
                    </ul>
                  )}
                </span>
              </li>
              <li><Link to={"/investigacion"}>Investigación</Link></li>
              <li><Link to={"/posgrado"}>Posgrado</Link></li>
              <li>
                <span className="relative">
                  <button onClick={toggleEventos} className="focus:outline-none">
                    Eventos {isEventosOpen ? <FaAngleUp className="inline-block" /> : <FaAngleDown className="inline-block" />}
                  </button>
                  {isEventosOpen && (
                    <ul className="absolute left-0 pl-4 mt-2 w-40 bg-white shadow-lg rounded-md p-2 border border-zinc-200 flex flex-col gap-2">
                      <li className="border-b border-gray-200 py-1"><Link to={"#"} target='_blank'>VII CIISIC</Link></li>
                      <li className="border-b border-gray-200 py-1"><Link to={"https://jepa.episundc.pe/"} target='_blank'>V JEPA</Link></li>
                      <li className="border-b border-gray-200 py-1"><Link to={"https://uifi.episundc.pe/"} target='_blank'>IV FEINFO</Link></li>
                    </ul>
                  )}
                </span>
              </li>
            </ul>
          </div>
          <div className='space-x-12 hidden md:flex items-center'>
            <Link to={"/contacto"} className='bg-primary py-2 px-4 transition-all duration-300 rounded text-white hover:text-gray-300 hover:bg-secondary'>Contacto</Link>
          </div>
          <div className='md:hidden'>
            <button onClick={toggleMenu} className='text-white focus:outline-none focus:text-gray-300'>
              {
                isMenuOpen ? (<FaXmark className='w-6 h-6 text-black' />) : (<FaBars className='w-6 h-6 text-black' />)
              }
            </button>
          </div>
        </div>
      </nav>
      <div className={`space-y-4 px-4 pt-24 pb-5 bg-secondary text-white text-xl ${isMenuOpen ? "block fixed top-0 right-0 left-0 z-20" : "hidden"} flex flex-col`}>
        <span className="relative">
          <button onClick={toggleFacultad} className="focus:outline-none">
            Facultad {isFacultadOpen ? <FaAngleUp className="inline-block" /> : <FaAngleDown className="inline-block" />}
          </button>
          {isFacultadOpen && (
            <ul className="absolute left-0 pl-4 mt-2 w-40 bg-secondary shadow-lg rounded-md p-2 border border-zinc-200 flex flex-col gap-2 z-30">
              <li className="border-b border-gray-200 py-1"><Link to={"/facultad"}>Nosotros</Link></li>
              <li className="border-b border-gray-200 py-1"><Link to={"/facultad/resoluciones"}>Resoluciones</Link></li>
            </ul>
          )}
        </span>
        <Link to={"/departamento"}>Departamento</Link>
        <span className="relative">
          <button onClick={toggleEscuela} className="focus:outline-none">
            Escuelas {isEscuelaOpen ? <FaAngleUp className="inline-block" /> : <FaAngleDown className="inline-block" />}
          </button>
          {isEscuelaOpen && (
            <ul className="absolute left-0 pl-4 mt-2 w-40 bg-secondary shadow-lg rounded-md p-2 border border-zinc-200 flex flex-col gap-2 z-30">
              <li className="border-b border-gray-200 py-1"><Link to={"/escuela"}>Ingeniería de Sistemas</Link></li>
              <li className="border-b border-gray-200 py-1"><Link to={"https://tutoria.undc.edu.pe/Login/index.php"} target='_blank'>Tutoria</Link></li>
              <li className="border-b border-gray-200 py-1"><Link to={"https://portal.undc.edu.pe/proyeccionsocial/"} target='_blank'>RSU</Link></li>
            </ul>
          )}
        </span>
        <Link to={"/investigacion"}>Investigación</Link>
        <Link to={"/posgrado"}>Posgrado</Link>
        <span className="relative">
          <button onClick={toggleEventos} className="focus:outline-none">
            Eventos {isEventosOpen ? <FaAngleUp className="inline-block" /> : <FaAngleDown className="inline-block" />}
          </button>
          {isEventosOpen && (
            <ul className="absolute left-0 pl-4 mt-2 w-40 bg-secondary shadow-lg rounded-md p-2 border border-zinc-200 flex flex-col gap-2 z-30">
              <li className="border-b border-gray-200 py-1"><Link to={"https://ciisic.fiundc.tech/"} target='_blank'>VI CIISIC</Link></li>
            </ul>
          )}
        </span>
        <Link to={"/contacto"}>Contacto</Link>
      </div>
    </>
  );
}

export default Navbar;