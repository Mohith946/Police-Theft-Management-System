import axios from 'axios';

const api = axios.create({
  baseURL: '', // Proxied via Vite
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to dynamically inject JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to catch global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Service Error]:', error.response || error.message);
    if (error.response && error.response.status === 401) {
      // Clear token and logout if session is expired
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
