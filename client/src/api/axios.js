import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined') {
            if (error.response?.status === 401) {
                window.dispatchEvent(new Event('auth:unauthorized'));
            }
            if (error.response?.data?.code === 'PASSWORD_CHANGE_REQUIRED') {
                window.dispatchEvent(new Event('auth:password-change-required'));
            }
        }
        return Promise.reject(error);
    }
);

export default instance
