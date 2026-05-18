import api from './api';

export const fetchCsrfToken = () => api.get('/sanctum/csrf-cookie', { baseURL: import.meta.env.VITE_API_URL });

const extractPayload = (response) => response?.data?.data ?? null;

// These are now legacy/placeholder as we use cookies
export const getAuthToken = () => {
  return localStorage.getItem('is_authenticated') === 'true';
};

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.startsWith('/admin')) {
      clearAuthData();
    }
    return Promise.reject(error);
  }
);

export const signupClient = (payload) => api.post('/signup', payload);

export const loginClient = (payload) => api.post('/login', payload);

export const resendVerificationEmail = (email) => api.post('/email/resend', { email });

export const verifyEmailCode = (email, code) => api.post('/email/verify-code', { email, code });

export const forgotPasswordClient = (payload) =>
  api.post('/forgot-password', payload);

export const resetPasswordClient = (payload) =>
  api.post('/reset-password', payload);

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

    return api.post('/profile', form);
  }

  return api.put('/profile', payload);
};

export const logoutClient = () => api.post('/logout');

export const logoutAllClient = () => api.post('/logout-all');

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
