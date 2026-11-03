import axios from './axios';

/* API sin autenticación: lo que muestra el carrusel de la portada */
export const getHeroRequest = () => axios.get('/portada/hero', { timeout: 8000 });

/* APIs del panel (administradores y editores) */
export const getHeroSlidesRequest = () => axios.get('/hero-slides');
export const createHeroSlideRequest = (slide) => axios.post('/hero-slides', slide);
export const updateHeroSlideRequest = (id, changes) => axios.put(`/hero-slides/${id}`, changes);
export const deleteHeroSlideRequest = (id) => axios.delete(`/hero-slides/${id}`);
export const reorderHeroSlidesRequest = (ids) => axios.put('/hero-slides/reorder', { ids });
export const updateHeroSettingsRequest = (changes) => axios.put('/hero-settings', changes);
