import axios from './axios'

export const getNoticiasRequest = () => axios.get('/noticias')

export const getNoticesRequest = () => axios.get('/notices')

export const getNoticeRequest = (id) => axios.get(`/notices/${id}`)

export const createNoticeRequest = (notice) => axios.post('/notices', notice)

export const updateNoticesRequest = (id, notice) => axios.put(`/notices/${id}`, notice)

export const deleteNoticeRequest = (id) => axios.delete(`/notices/${id}`)