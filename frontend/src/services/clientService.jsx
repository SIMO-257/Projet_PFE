import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL ?? '';

// Global axios defaults for CSRF support
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

const clientApi = axios.create({
  baseURL: `${apiBase}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// CSRF cookie fetch (required for Sanctum SPA auth)
export const fetchCsrfToken = () => axios.get(`${apiBase}/sanctum/csrf-cookie`, { withCredentials: true });



const extractPayload = (response) => response?.data?.data ?? null;

// These are now legacy/placeholder as we use cookies
export const getAuthToken = () => localStorage.getItem('is_authenticated') === 'true';

export const setAuthToken = () => {
  // We don't use the token from response anymore, but we'll store a flag
  localStorage.setItem('is_authenticated', 'true');
};

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

export const clearAuthData = () => {

  localStorage.removeItem('is_authenticated');

};

clientApi.interceptors.request.use((config) => {
  // No need to manually add Bearer token as withCredentials handles cookies
  return config;
});

clientApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[AXIOS] Response error:', error.message, 'Status:', error.response?.status);
    if (error.response?.status === 401) {
      console.log('[AXIOS] 401 detected, clearing auth data');
      clearAuthData();
      // Don't redirect here - let the component/thunk handle it
      // This prevents conflicts with React routing
    }
    return Promise.reject(error);
  }
);

export const signupClient = (payload) => clientApi.post('/signup', payload);

export const loginClient = (payload) => clientApi.post('/login', payload);

export const forgotPasswordClient = (payload) =>
  clientApi.post('/forgot-password', payload);

export const resetPasswordClient = (payload) =>
  clientApi.post('/reset-password', payload);

export const fetchClientProfile = () => clientApi.get('/profile').then(extractPayload);

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

    return clientApi.post('/profile', form);
  }

  return clientApi.put('/profile', payload);
};

export const logoutClient = () => clientApi.post('/logout');

export const logoutAllClient = () => clientApi.post('/logout-all');

export const fetchClientHome = () => clientApi.get('/home').then(extractPayload);

export const fetchWalletDetails = () => clientApi.get('/wallet').then(extractPayload);

export const fetchTransactionHistory = () => clientApi.get('/wallet/transactions').then(extractPayload);

export const initRecharge = (payload) => clientApi.post('/wallet/recharge/init', payload);

export const confirmRecharge = (payload) => clientApi.post('/wallet/recharge/confirm', payload);

export const fetchTicketTypes = () => clientApi.get('/ticket-types').then(extractPayload);

export const purchaseTicket = (payload) => clientApi.post('/tickets/purchase', payload);

export const fetchMyTickets = () => clientApi.get('/tickets').then(extractPayload);

export const validateTicket = (uuid, payload) => clientApi.post(`/tickets/${uuid}/validate`, payload);

export default clientApi;
