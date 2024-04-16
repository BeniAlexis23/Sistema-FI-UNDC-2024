import axios from './axios'

export const getResolucionesRequest = () => axios.get('/resoluciones')

export const getRcfsRequest = () => axios.get('/rcfs')

export const getRcfRequest = (id) => axios.get(`/rcfs/${id}`)

export const createRcfRequest = (rcf) => axios.post('/rcfs', rcf)

export const updateRcfsRequest = (id, rcf) => axios.put(`/rcfs/${id}`, rcf)

export const deleteRcfRequest = (id) => axios.delete(`/rcfs/${id}`)