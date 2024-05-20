import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:3000/api',  //Produccion: 'https://fi.undc.edu.pe/api'
    withCredentials: true
});

export default instance