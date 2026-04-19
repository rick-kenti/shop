import axios from 'axios';

const getBaseURL = () => {
  // Local development — talk directly to Flask
  if (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5000/api';
  }
  // Production on Vercel — use same domain, Vercel rewrites handle it
  return `${window.location.origin}/api`;
};

const API_URL = getBaseURL();
console.log('API_URL =', API_URL);

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
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log(`→ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error('❌ NETWORK ERROR');
      console.error('URL attempted:', error.config?.baseURL + error.config?.url);
      console.error('Error:', error.message);
    } else {
      console.error(`❌ ${error.response.status}`, error.response.data);
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