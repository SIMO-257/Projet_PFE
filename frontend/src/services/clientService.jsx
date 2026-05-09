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

const AUTH_FLAG_KEY = 'is_authenticated';
const AUTH_REMEMBER_KEY = 'auth_remember';

// These are now legacy/placeholder as we use cookies
export const getAuthToken = () => localStorage.getItem(AUTH_FLAG_KEY) === 'true';

export const setAuthToken = () => {
  // We don't use the token from response anymore, but we'll store a flag
  localStorage.setItem(AUTH_FLAG_KEY, 'true');
};

export const setAuthPersistence = (rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem(AUTH_REMEMBER_KEY, 'true');
    localStorage.setItem(AUTH_FLAG_KEY, 'true');
    sessionStorage.removeItem(AUTH_FLAG_KEY);
    return;
  }

  localStorage.removeItem(AUTH_REMEMBER_KEY);
  localStorage.removeItem(AUTH_FLAG_KEY);
  sessionStorage.setItem(AUTH_FLAG_KEY, 'true');
};

export const shouldRestoreAuthSession = () => {
  const remembered = localStorage.getItem(AUTH_REMEMBER_KEY) === 'true';
  const activeSession = sessionStorage.getItem(AUTH_FLAG_KEY) === 'true';
  return remembered || activeSession;
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
  localStorage.removeItem(AUTH_FLAG_KEY);
  localStorage.removeItem(AUTH_REMEMBER_KEY);
  sessionStorage.removeItem(AUTH_FLAG_KEY);
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
export const fetchPurchasedCards = () => clientApi.get('/tickets/cards').then(extractPayload);
export const setDefaultPurchasedCard = (ticketId) => clientApi.post('/tickets/cards/default', { ticket_id: ticketId }).then(extractPayload);

export const fetchTicketDetails = (uuid) => clientApi.get(`/tickets/${uuid}`).then(extractPayload);

export const validateTicket = (uuid, payload) => clientApi.post(`/tickets/${uuid}/validate`, payload);
export const createNfcChallenge = () => clientApi.post('/tickets/nfc/challenge').then(extractPayload);
export const consumeNfcChallenge = (payload) => clientApi.post('/tickets/nfc/consume', payload).then(extractPayload);
export const createQrValidationToken = (payload) => clientApi.post('/tickets/qr/token', payload).then(extractPayload);
export const consumeQrValidationToken = (payload) => clientApi.post('/tickets/qr/consume', payload).then(extractPayload);

export const createPaymentIntent = (payload) => clientApi.post('/payments/create-intent', payload);

export const saveBillingDetails = (payload) => clientApi.post('/payments/billing-details', payload);

export default clientApi;
