import api from './api';

// Auth
export const adminLogin  = (credentials) => api.post('/admin/login', credentials);
export const adminLogout = ()             => api.post('/admin/logout');
export const adminMe     = ()             => api.get('/admin/me');

// Dashboard
export const getDashboardStats = () => api.get('/admin/dashboard');

// Clients
export const getClients       = (params) => api.get('/admin/clients', { params });
export const getClient        = (id)     => api.get(`/admin/clients/${id}`);
export const toggleClientStatus = (id)  => api.patch(`/admin/clients/${id}/toggle-status`);

// Tickets
export const getAdminTickets = (params) => api.get('/admin/tickets', { params });

// Transactions
export const getAdminTransactions = (params) => api.get('/admin/transactions', { params });

// Notifications
export const sendAdminNotification = (data) => api.post('/admin/notifications/send', data);

// Profile
export const updateAdminProfile = (data) => api.put('/admin/profile', data);
