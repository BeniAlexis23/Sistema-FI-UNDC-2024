import logoFi from '../assets/logo-fi.png';

/* Marcador local para noticias sin portada (antes se pedía una imagen a un servicio externo) */
const CoverPlaceholder = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-sky-50 ${className}`}
  >
    <img src={logoFi} alt="" className="h-1/3 max-h-24 w-auto opacity-60" />
  </div>
);

export default CoverPlaceholder;
