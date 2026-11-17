import axios from './axios';

/* API sin autenticación: menú de eventos, página /eventos y la historia de cada serie */
export const getEventosRequest = () => axios.get('/eventos', { timeout: 8000 });
export const getEventoRequest = (slug) => axios.get(`/eventos/${encodeURIComponent(slug)}`, { timeout: 8000 });

/* APIs del panel (administradores y editores) */
export const getEventSeriesRequest = () => axios.get('/event-series');
export const createEventSeriesRequest = (series) => axios.post('/event-series', series);
export const updateEventSeriesRequest = (id, changes) => axios.put(`/event-series/${id}`, changes);
export const deleteEventSeriesRequest = (id) => axios.delete(`/event-series/${id}`);

export const getEventEditionsRequest = (params) => axios.get('/event-editions', { params });
export const getEventEditionRequest = (id) => axios.get(`/event-editions/${id}`);
export const createEventEditionRequest = (edition) => axios.post('/event-editions', edition);
export const updateEventEditionRequest = (id, changes) => axios.put(`/event-editions/${id}`, changes);
export const deleteEventEditionRequest = (id) => axios.delete(`/event-editions/${id}`);
export const setEventEditionDestacadaRequest = (id, destacada = true) => axios.patch(`/event-editions/${id}/destacada`, { destacada });
export const setEventEditionVisibilityRequest = (id, hidden) => axios.patch(`/event-editions/${id}/visibility`, { hidden });
