import axios from 'axios';

// Hardcode the Render URL as fallback — no trailing slash
const PROD_URL = 'https://stockmanager-backend-ld7p.onrender.com/api';
const DEV_URL = 'http://127.0.0.1:5000/api';

const API_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? DEV_URL : PROD_URL);

console.log('API connecting to:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds — handles Render cold start
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Attach token to every request
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

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error — backend sleeping or CORS issue
      console.error('Network Error:', error.message);
    } else {
      console.error(`${error.response.status}:`, error.response.data);
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