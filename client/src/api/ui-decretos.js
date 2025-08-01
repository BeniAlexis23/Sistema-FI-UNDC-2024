import axios from './axios'

/* APIs sin autenticación */
export const getUIDecretosRequest = () => axios.get('/investigacion')

/* APIs protegidas con autenticación */
export const getDecretosRequest = () => axios.get('/decretos')

export const getDecretoRequest = (id) => axios.get(`/decretos/${id}`)

export const createDecretoRequest = (decreto) => axios.post('/decretos', decreto)

export const updateDecretoRequest = (id, decreto) => axios.put(`/decretos/${id}`, decreto)

export const deleteDecretoRequest = (id) => axios.delete(`/decretos/${id}`)