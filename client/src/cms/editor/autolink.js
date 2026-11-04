/* El editor vuelve enlace cualquier texto con forma de dominio, y «M.Sc», «Ph.D.» o «a.m.» la tienen (.sc es un dominio real).
   Solo se enlaza solo lo que se escribe con protocolo, con «www.» o como correo; el botón Enlace sirve para todo lo demás. */
const TYPED_LINK = /^(?:(?:https?:\/\/|mailto:|www\.)\S+|[^\s@]+@[^\s@]+\.[^\s@]+)$/i;

export const shouldAutoLink = (text) => TYPED_LINK.test(text.trim());
