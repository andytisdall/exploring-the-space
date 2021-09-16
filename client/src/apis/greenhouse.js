import axios from 'axios';


const instance = axios.create({
    baseURL: 'http://localhost:3000/api',
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