import axios from './axios';

/* APIs sin autenticación */
export const getNoticiasRequest = (params) => axios.get('/noticias', { params });
export const getNoticiaRequest = (id) => axios.get(`/noticias/${id}`);
export const getCategoriasRequest = () => axios.get('/categorias');

/* APIs protegidas con autenticación */
export const getNoticesRequest = () => axios.get('/notices');
export const getNoticesPageRequest = (params) => axios.get('/notices', { params });
export const getNoticeStatsRequest = () => axios.get('/notices/stats');
export const getNoticeRequest = (id) => axios.get(`/notices/${id}`);

export const createNoticeRequest = (notice) => axios.post('/notices', notice, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

export const updateNoticesRequest = (id, notice) => axios.put(`/notices/${id}`, notice, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

/* El editor por bloques envía JSON (la portada y las fotos se suben antes con /media) */
export const createNoticeJsonRequest = (notice) => axios.post('/notices', notice);
export const updateNoticeJsonRequest = (id, notice) => axios.put(`/notices/${id}`, notice);
export const updateNoticeVisibilityRequest = (id, changes) => axios.patch(`/notices/${id}/visibility`, changes);

export const deleteNoticeRequest = (id) => axios.delete(`/notices/${id}`);
