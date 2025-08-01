import Banner from "../shared/Banner"
import newImg from "../assets/newImg.webp"

const Newsletter = () => {
    return (
        <div className="md:px-14 p-4 max-w-screen-2xl mx-auto mb-24">
            {/*use our banner component and pass props */}
            <Banner banner={newImg} heading={"A nuestros estudiantes..."} subheading={"En la Facultad de Ingeniería de la UNDC, transformamos ideas en innovación, desafíos en oportunidades y conocimiento en progreso. Impulsamos el desarrollo de futuros líderes en ingeniería, forjando un camino hacia un mundo más tecnológico, sostenible y próspero. ¡Únete a nosotros y sé parte del cambio que impulsa el mañana desde hoy en la UNDC!"}/>
        </div>
    )
}

export default Newsletter
