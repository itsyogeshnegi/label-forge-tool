import axios from 'axios';

// Create custom axios instance
const api = axios.create({
  baseURL: '', // Empty base URL so it uses current domain/proxy settings
  withCredentials: true, // Send cookies with all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
