import Swal from 'sweetalert2';
import { FaFacebookF } from 'react-icons/fa';
import { MdEmail, MdOutlinePhoneInTalk } from 'react-icons/md';
import { FiMapPin } from 'react-icons/fi';
import { BsInstagram, BsLinkedin } from 'react-icons/bs';

import Navbar from '../components/Navbar';
import Footer from '../shared/Footer';

const socialLinks = [
  {
    href: 'https://www.facebook.com/FIUNDC',
    label: 'Facebook',
    icon: FaFacebookF,
  },
  {
    href: 'https://www.instagram.com/',
    label: 'Instagram',
    icon: BsInstagram,
  },
  {
    href: 'https://www.linkedin.com/',
    label: 'LinkedIn',
    icon: BsLinkedin,
  },
];

const Contacto = () => {
  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    formData.append('access_key', '9bb433ef-1570-4f25-ae4c-f94986ac606f');

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: json,
    }).then((response) => response.json());

    if (res.success) {
      Swal.fire({
        title: 'Hecho',
        text: 'Tu mensaje fue enviado correctamente.',
        icon: 'success',
        confirmButtonColor: '#1081ea',
      });

      event.target.reset();
    }
  };

  return (
    <>
      <Navbar />

      <section className="mx-auto mt-24 w-full max-w-screen-2xl overflow-hidden px-4 sm:px-6 md:px-14">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
            Comunicación institucional
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-[2.9rem] xl:text-[3.1rem]">
            Contáctanos
          </h1>
        </div>

        <div className="mt-10 grid w-full min-w-0 gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_55px_rgba(15,23,42,0.08)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
              Estamos para ayudarte
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Conversemos con la Facultad de Ingeniería
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Si tienes consultas, sugerencias o necesitas orientación, puedes escribirnos mediante el formulario.
              Nuestro equipo revisará tu mensaje y te responderá a la brevedad.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex min-w-0 items-start gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4 sm:px-5">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-primary">
                  <MdEmail className="text-2xl" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Correo</p>
                  <p className="mt-1 break-words text-base font-semibold text-slate-900">
                    coordinacioningenieria@undc.edu.pe
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4 sm:px-5">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-primary">
                  <MdOutlinePhoneInTalk className="text-2xl" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Atención</p>
                  <p className="mt-1 break-words text-base font-semibold text-slate-900">
                    Respuesta por correo institucional
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4 sm:px-5">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-primary">
                  <FiMapPin className="text-xl" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Ubicación</p>
                  <p className="mt-1 break-words text-base font-semibold text-slate-900">
                    Av. Mariscal Benavides N.° 322, San Vicente - Cañete
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Redes sociales
              </p>
              <div className="mt-4 flex items-center gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:-translate-y-1 hover:border-sky-200 hover:bg-sky-50 hover:text-primary"
                    >
                      <Icon className="text-lg" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_55px_rgba(15,23,42,0.08)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/80 sm:text-sm">
              Formulario web
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Envíanos un mensaje
            </h2>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <input
                type="text"
                name="Nombres"
                required
                placeholder="Nombres"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300"
              />
              <input
                type="email"
                name="Correo"
                required
                placeholder="Correo"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300"
              />
              <input
                type="text"
                name="Celular"
                required
                placeholder="Celular"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300"
              />
              <input
                type="text"
                name="Asunto"
                required
                placeholder="Asunto"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300"
              />
              <textarea
                name="Mensaje"
                rows="6"
                required
                placeholder="Mensaje"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300"
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-secondary"
              >
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contacto;
