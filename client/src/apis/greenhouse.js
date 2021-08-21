import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://localhost:3001',
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (err) => {
        return Promise.reject(err);
    }
);

export default instance;