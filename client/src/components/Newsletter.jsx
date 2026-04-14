import Banner from '../shared/Banner';
import newImg from '../assets/newImg.webp';

const Newsletter = () => {
  return (
    <section className="mx-auto mb-16 max-w-screen-2xl px-4 md:px-14">
      <Banner
        banner={newImg}
        eyebrow="Mensaje institucional"
        heading="A nuestros estudiantes"
        subheading="En la Facultad de Ingeniería de la UNDC, transformamos ideas en innovación, desafíos en oportunidades y conocimiento en progreso. Impulsamos la formación de futuros líderes en ingeniería, abriendo camino hacia un entorno más tecnológico, sostenible y competitivo. Queremos que cada estudiante encuentre aquí el espacio para crecer, crear y aportar desde hoy al cambio que viene."
      />
    </section>
  );
};

export default Newsletter;
