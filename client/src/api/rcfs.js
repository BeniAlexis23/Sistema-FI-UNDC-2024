import axios from './axios'

/* APIs sin autenticación */
export const getResolucionesRequest = () => axios.get('/resoluciones')

/* APIs protegidas con autenticación */
export const getRcfsRequest = () => axios.get('/rcfs')

export const getRcfRequest = (id) => axios.get(`/rcfs/${id}`)

export const createRcfRequest = (rcf) => axios.post('/rcfs', rcf)

export const updateRcfsRequest = (id, rcf) => axios.put(`/rcfs/${id}`, rcf)

export const deleteRcfRequest = (id) => axios.delete(`/rcfs/${id}`)