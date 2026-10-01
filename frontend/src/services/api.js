import axios from 'axios';

const API = axios.create( {
    baseURL : 'http://localhost:3000/api'
});

//middleware cliente 
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token_comersail');
    if (token) {
        config.headers.Authorization = `bearer ${token}`;
    }
    return config
});

export default API;