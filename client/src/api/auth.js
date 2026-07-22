import axios from './axios';

export const loginRequest  = user => axios.post(`/login`, user);

export const verityTokenRequet = () => axios.get('/verify');

export const changePasswordRequest = passwords => axios.post('/change-password', passwords);

export const logoutRequest = () => axios.post('/logout');
