import axios from 'axios';

const configuredApiBase = import.meta.env.VITE_API_URL ?? '';
const apiBase = configuredApiBase.replace(/\/+$/, '');

const adminApi = axios.create({
  baseURL: `${apiBase}/api`,
  headers: {
    Accept: 'application/json',
  },
});

const ADMIN_TOKEN_KEY = 'admin_token';

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY);

export const setAdminToken = (token, remember = false) => {
  if (!token) return;
  if (remember) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } else {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
};

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const adminLogin  = (credentials) => adminApi.post('/admin/login', credentials);
export const adminLogout = ()             => adminApi.post('/admin/logout');
export const adminMe     = ()             => adminApi.get('/admin/me');

// Dashboard
export const getDashboardStats = () => adminApi.get('/admin/dashboard');

// Users (formerly Clients)
export const getUsers       = (params) => adminApi.get('/admin/users', { params });
export const getUser        = (id)     => adminApi.get(`/admin/users/${id}`);
export const toggleUserStatus = (id)  => adminApi.patch(`/admin/users/${id}/toggle-status`);

// Tickets
export const getAdminTickets = (params) => adminApi.get('/admin/tickets', { params });

// Transactions
export const getAdminTransactions = (params) => adminApi.get('/admin/transactions', { params });

// Notifications
export const sendAdminNotification = (data) => adminApi.post('/admin/notifications/send', data);

// Profile
export const updateAdminProfile = (data) => adminApi.put('/admin/profile', data);

export default adminApi;
