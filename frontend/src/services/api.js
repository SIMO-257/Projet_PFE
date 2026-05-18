import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL ?? '';

// Global axios defaults for CSRF support
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

const api = axios.create({
  baseURL: `${apiBase}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Interceptor for Admin Token
api.interceptors.request.use((config) => {
  if (config.url?.startsWith('/admin')) {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  }
  return config;
});

export default api;
