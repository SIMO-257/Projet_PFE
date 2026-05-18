<<<<<<< HEAD
import axios from 'axios';

const configuredApiBase = import.meta.env.VITE_API_URL;
const apiBase = configuredApiBase.replace(/\/+$/, '');

const clientApi = axios.create({
  baseURL: `${apiBase}/api`,
  headers: {
    Accept: 'application/json',
  },
});

=======
import api from './api';

export const fetchCsrfToken = () => api.get('/sanctum/csrf-cookie', { baseURL: import.meta.env.VITE_API_URL });
>>>>>>> bce7596e (Add admin dashboard, authentication and management system)

const extractPayload = (response) => response?.data?.data ?? null;

const API_TOKEN_KEY = 'auth_token';

export const getAuthToken = () => localStorage.getItem(API_TOKEN_KEY) || sessionStorage.getItem(API_TOKEN_KEY);

export const setAuthToken = (token, rememberMe = false) => {
  if (!token) return;
  if (rememberMe) {
    localStorage.setItem(API_TOKEN_KEY, token);
    sessionStorage.removeItem(API_TOKEN_KEY);
  } else {
    sessionStorage.setItem(API_TOKEN_KEY, token);
    localStorage.removeItem(API_TOKEN_KEY);
  }
};

export const clearAuthData = () => {
  localStorage.removeItem(API_TOKEN_KEY);
  sessionStorage.removeItem(API_TOKEN_KEY);
};

export const shouldRestoreAuthSession = () => !!getAuthToken();

export const setClientUuid = (uuid, rememberMe = false) => {
  if (!uuid) return;

  if (rememberMe) {
    localStorage.setItem('client_uuid', uuid);
    sessionStorage.removeItem('client_uuid');
  } else {
    sessionStorage.setItem('client_uuid', uuid);
    localStorage.removeItem('client_uuid');
  }
};

<<<<<<< HEAD
clientApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

clientApi.interceptors.response.use(
=======
export const clearAuthData = () => {
  localStorage.removeItem('is_authenticated');
};

api.interceptors.response.use(
>>>>>>> bce7596e (Add admin dashboard, authentication and management system)
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.startsWith('/admin')) {
      clearAuthData();
<<<<<<< HEAD
      // Don't redirect here - let the component/thunk handle it
=======
>>>>>>> bce7596e (Add admin dashboard, authentication and management system)
    }
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
// ── Auth ──────────────────────────────────────────────────────────────────────

export const signupClient = async (payload) => {
  return clientApi.post('/signup', payload);
};

export const loginClient = async (payload) => {
  return clientApi.post('/login', payload);
};

export const forgotPasswordClient = async (payload) => {
  return clientApi.post('/forgot-password', payload);
};

export const resetPasswordClient = async (payload) => {
  return clientApi.post('/reset-password', payload);
};

// ── Profile ───────────────────────────────────────────────────────────────────
=======
export const signupClient = (payload) => api.post('/signup', payload);

export const loginClient = (payload) => api.post('/login', payload);

export const resendVerificationEmail = (email) => api.post('/email/resend', { email });

export const verifyEmailCode = (email, code) => api.post('/email/verify-code', { email, code });

export const forgotPasswordClient = (payload) =>
  api.post('/forgot-password', payload);

export const resetPasswordClient = (payload) =>
  api.post('/reset-password', payload);
>>>>>>> bce7596e (Add admin dashboard, authentication and management system)

export const fetchClientProfile = () => api.get('/profile').then(extractPayload);

export const updateClientProfile = ({ payload = {}, avatarFile = null }) => {
  if (avatarFile) {
    const form = new FormData();
    form.append('_method', 'PUT');
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, value);
      }
    });
    form.append('profile_file', avatarFile);
<<<<<<< HEAD
    return clientApi.post('/profile', form);
  }
  return clientApi.put('/profile', payload);
=======

    return api.post('/profile', form);
  }

  return api.put('/profile', payload);
>>>>>>> bce7596e (Add admin dashboard, authentication and management system)
};

export const logoutClient = () => api.post('/logout');

export const logoutAllClient = () => api.post('/logout-all');

<<<<<<< HEAD
export default clientApi;
=======
export const fetchClientHome = () => api.get('/home').then(extractPayload);

export const fetchWalletDetails = () => api.get('/wallet').then(extractPayload);

export const fetchTransactionHistory = () => api.get('/wallet/transactions').then(extractPayload);

export const initRecharge = (payload) => api.post('/wallet/recharge/init', payload);

export const confirmRecharge = (payload) => api.post('/wallet/recharge/confirm', payload);

export const fetchTicketTypes = () => api.get('/ticket-types').then(extractPayload);

export const purchaseTicket = (payload) => api.post('/tickets/purchase', payload);

export const fetchMyTickets = () => api.get('/tickets').then(extractPayload);
export const fetchPurchasedCards = () => api.get('/tickets/cards').then(extractPayload);
export const setDefaultPurchasedCard = (ticketId) => api.post('/tickets/cards/default', { ticket_id: ticketId }).then(extractPayload);

export const fetchTicketDetails = (uuid) => api.get(`/tickets/${uuid}`).then(extractPayload);

export const validateTicket = (uuid, payload) => api.post(`/tickets/${uuid}/validate`, payload);
export const createNfcChallenge = () => api.post('/tickets/nfc/challenge').then(extractPayload);
export const consumeNfcChallenge = (payload) => api.post('/tickets/nfc/consume', payload).then(extractPayload);
export const createQrValidationToken = (payload) => api.post('/tickets/qr/token', payload).then(extractPayload);
export const consumeQrValidationToken = (payload) => api.post('/tickets/qr/consume', payload).then(extractPayload);

export const createPaymentIntent = (payload) => api.post('/payments/create-intent', payload);

export const saveBillingDetails = (payload) => api.post('/payments/billing-details', payload);

export default api;
>>>>>>> bce7596e (Add admin dashboard, authentication and management system)
