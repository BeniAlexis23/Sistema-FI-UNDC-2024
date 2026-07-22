import axios from './axios';

export const getUsersRequest = () => axios.get('/users');
export const createUserRequest = (user) => axios.post('/users', user);
export const updateUserRequest = (id, changes) => axios.patch(`/users/${id}`, changes);
export const resetUserPasswordRequest = (id, password) => axios.post(`/users/${id}/reset-password`, { password });
