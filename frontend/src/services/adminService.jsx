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

// 401 interceptor — clear admin token and redirect to admin login
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAdminToken();
      // Redirect to admin login (only if not already there)
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const adminLogin = (credentials) => adminApi.post('/admin/login', credentials);
export const adminLogout = () => adminApi.post('/admin/logout');
export const adminMe = () => adminApi.get('/admin/me');

// Dashboard
export const getDashboardStats = (params) => adminApi.get('/admin/dashboard', { params });

// Users (formerly Clients)
export const getUsers = (params) => adminApi.get('/admin/users', { params });
export const getUser = (id) => adminApi.get(`/admin/users/${id}`);
export const toggleUserStatus = (id) => adminApi.patch(`/admin/users/${id}/toggle-status`);

// Tickets
export const getAdminTickets = (params) => adminApi.get('/admin/tickets', { params });

// Transactions
export const getAdminTransactions = (params) => adminApi.get('/admin/transactions', { params });

// Notifications
export const sendAdminNotification = (data) => adminApi.post('/admin/notifications/send', data);

// Profile
export const updateAdminProfile = (data) => adminApi.put('/admin/profile', data);

// Student Verifications
export const getStudentVerifications = (params) => adminApi.get('/admin/student-verifications', { params });
export const getStudentVerification = (id) => adminApi.get(`/admin/student-verifications/${id}`);
export const approveStudentVerification = (id) => adminApi.post(`/admin/student-verifications/${id}/approve`);
export const rejectStudentVerification = (id, reason) => adminApi.post(`/admin/student-verifications/${id}/reject`, { reason });

// Validator (admin)
export const adminValidateTicket = (uuid, payload) =>
  adminApi.post(`/admin/validator/validate-ticket/${uuid}`, payload);

export const adminConsumeQrValidationToken = (payload) =>
  adminApi.post('/admin/validator/consume-qr', payload);

export const adminLookupTicket = (ticketUuid) =>
  adminApi.post('/admin/validator/lookup', { ticket_uuid: ticketUuid });

// Admin Management (super admin)
export const getAdmins = (params) => adminApi.get('/admin/admins', { params });
export const getAdmin = (id) => adminApi.get(`/admin/admins/${id}`);
export const createAdmin = (data) => adminApi.post('/admin/admins', data);
export const updateAdminBySuper = (id, data) => adminApi.put(`/admin/admins/${id}`, data);
export const toggleAdminStatus = (id) => adminApi.patch(`/admin/admins/${id}/toggle-status`);
export const deleteAdmin = (id) => adminApi.delete(`/admin/admins/${id}`);
export const deleteAdminWithPassword = (id, data) => adminApi.post(`/admin/admins/${id}/delete`, data);

// ── Helpers ───────────────────────────────────────────────────
const downloadBlob = (response, filename) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename || 'export.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ── Audit Logs ────────────────────────────────────────────────
export const getAuditLogs = (params) => adminApi.get('/admin/audit-logs', { params });
export const exportAuditLogs = async (params) => {
  const response = await adminApi.get('/admin/audit-logs/export', { params, responseType: 'blob' });
  const disposition = response.headers?.['content-disposition'];
  const match = disposition?.match(/filename="?([^";]+)"?/);
  downloadBlob(response, match?.[1] || 'audit-logs.csv');
};

// ── Notification History ──────────────────────────────────────
export const getNotificationLog = (params) => adminApi.get('/admin/notifications/log', { params });
export const exportNotificationLog = async (params) => {
  const response = await adminApi.get('/admin/notifications/log/export', { params, responseType: 'blob' });
  const disposition = response.headers?.['content-disposition'];
  const match = disposition?.match(/filename="?([^";]+)"?/);
  downloadBlob(response, match?.[1] || 'notification-history.csv');
};

// ── Ticket Types (Fare Manager) ───────────────────────────────
export const getTicketTypes = (params) => adminApi.get('/admin/ticket-types', { params });
export const createTicketType = (data) => adminApi.post('/admin/ticket-types', data);
export const updateTicketType = (id, data) => adminApi.put(`/admin/ticket-types/${id}`, data);
export const toggleTicketTypeStatus = (id) => adminApi.patch(`/admin/ticket-types/${id}/toggle-status`);
export const deleteTicketType = (id) => adminApi.delete(`/admin/ticket-types/${id}`);

// ── CSV Exports ────────────────────────────────────────────────
export const exportUsersCSV = async (params) => {
  const response = await adminApi.get('/admin/users/export', { params, responseType: 'blob' });
  const disposition = response.headers?.['content-disposition'];
  const match = disposition?.match(/filename="?([^";]+)"?/);
  downloadBlob(response, match?.[1] || 'utilisateurs.csv');
};
export const exportTicketsCSV = async (params) => {
  const response = await adminApi.get('/admin/tickets/export', { params, responseType: 'blob' });
  const disposition = response.headers?.['content-disposition'];
  const match = disposition?.match(/filename="?([^";]+)"?/);
  downloadBlob(response, match?.[1] || 'tickets.csv');
};
export const exportTransactionsCSV = async (params) => {
  const response = await adminApi.get('/admin/transactions/export', { params, responseType: 'blob' });
  const disposition = response.headers?.['content-disposition'];
  const match = disposition?.match(/filename="?([^";]+)"?/);
  downloadBlob(response, match?.[1] || 'transactions.csv');
};

export default adminApi;
