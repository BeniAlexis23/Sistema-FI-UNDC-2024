export const CATEGORY_NAME_MIN = 2;
export const CATEGORY_NAME_MAX = 40;

/* Nombre sin espacios sobrantes, tal como se envía al servidor */
export const cleanCategoryName = (name) => name.replace(/\s+/g, ' ').trim();

/* Misma regla que el servidor (backend/src/libs/slug.js): dos nombres con el mismo identificador son la misma categoría */
export const categorySlug = (name) => name
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

/* Mensaje para mostrar antes de enviar; cadena vacía si el nombre es válido */
export const categoryNameError = (name) => {
  const clean = cleanCategoryName(name);
  if (clean.length < CATEGORY_NAME_MIN) return `Escribe al menos ${CATEGORY_NAME_MIN} caracteres.`;
  if (clean.length > CATEGORY_NAME_MAX) return `El nombre puede tener hasta ${CATEGORY_NAME_MAX} caracteres.`;
  if (!categorySlug(clean)) return 'Usa letras o números en el nombre.';
  return '';
};

/* La categoría que ya se llama así, sin distinguir mayúsculas, acentos ni signos */
export const findCategoryByName = (categories, name) => {
  const wanted = categorySlug(name);
  return wanted ? categories.find((category) => categorySlug(category.name) === wanted) : undefined;
};

/* Inserta la categoría nueva donde la muestra el servidor: por posición y luego por nombre */
export const withCategory = (categories, created) => [...categories.filter((category) => category._id !== created._id), created]
  .sort((first, second) => (first.order - second.order) || first.name.localeCompare(second.name, 'es'));
