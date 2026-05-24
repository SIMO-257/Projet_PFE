import axios from 'axios';

const configuredApiBase = import.meta.env.VITE_API_URL;
const apiBase = configuredApiBase.replace(/\/+$/, '');

const clientApi = axios.create({
  baseURL: `${apiBase}/api`,
  headers: {
    Accept: 'application/json',
  },
});

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

clientApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Send the user's language preference so the backend returns
  // translated database content (ticket types, etc.) in the right locale
  const lang = localStorage.getItem('app_lang') || 'fr';
  config.headers['X-Locale'] = lang;

  return config;
});

clientApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/admin')) {
      clearAuthData();
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const signupClient = async (payload) => {
  return clientApi.post('/signup', payload);
};

export const loginClient = async (payload) => {
  return clientApi.post('/login', payload);
};

export const resendVerificationEmail = (email) => clientApi.post('/email/resend', { email });

export const verifyEmailCode = (email, code) => clientApi.post('/email/verify-code', { email, code });

export const forgotPasswordClient = async (payload) => {
  return clientApi.post('/forgot-password', payload);
};

export const resetPasswordClient = async (payload) => {
  return clientApi.post('/reset-password', payload);
};

// ── Profile ───────────────────────────────────────────────────────────────────

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

export default clientApi;
