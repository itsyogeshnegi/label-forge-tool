import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Use VITE_API_URL environment variable in production, empty for local proxy
  withCredentials: true, // Send cookies with all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach Authorization Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Auto logout on 401 Unauthorized response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token from localStorage to log out client-side
      localStorage.removeItem('token');
      
      // Redirect to login page if we aren't already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

