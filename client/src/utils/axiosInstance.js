import axios from 'axios';
import { API_PATHS, BASE_URL } from './apiPath';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }       
    return config;
}, error => {
    return Promise.reject(error);
}
);

//response interceptor to handle errors globally
axiosInstance.interceptors.response.use(response => {
    return response;    

}, error => {
    if (error.response) {
        if (error.response.status === 401) {    
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }   
    return Promise.reject(error);
});

export default axiosInstance;