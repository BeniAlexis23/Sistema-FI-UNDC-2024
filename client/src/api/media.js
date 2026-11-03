import axios from './axios';

/* Sube una imagen y devuelve { url, thumbUrl, width, height } */
export const uploadMediaRequest = (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
    });
};
