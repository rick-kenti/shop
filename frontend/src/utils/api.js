import axios from 'axios';

// Detect environment automatically
const isLocal = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

const API_URL = isLocal
  ? 'http://127.0.0.1:5000/api'
  : process.env.REACT_APP_API_URL || 'https://stockmanager-backend-ld7p.onrender.com';

console.log('🌐 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('❌ Network Error — backend may be sleeping or CORS blocked');
      console.error('Request URL was:', error.config?.baseURL + error.config?.url);
    } else {
      console.error(`❌ ${error.response.status}:`, error.response.data);
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;