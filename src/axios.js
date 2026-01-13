import axios from 'axios';

// 1. Apuntamos directo a tu nube en Railway
const api = axios.create({
    baseURL: 'https://laravelapi-production-1d4c.up.railway.app/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 2. El Interceptor (Tu llave maestra para que no te pida login a cada rato)
api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;