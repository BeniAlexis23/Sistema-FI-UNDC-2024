import axios from './axios';

/* APIs sin autenticación */
export const getNoticiasRequest = () => axios.get('/noticias');
export const getNoticiaRequest = (id) => axios.get(`/noticias/${id}`);

/* APIs protegidas con autenticación */
export const getNoticesRequest = () => axios.get('/notices');
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

export const deleteNoticeRequest = (id) => axios.delete(`/notices/${id}`);