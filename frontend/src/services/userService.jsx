import axios from 'axios';

const configuredApiBase = import.meta.env.VITE_API_URL;
const apiBase = configuredApiBase.replace(/\/+$/, '');

const userApi = axios.create({
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

export const setUserUuid = (uuid, rememberMe = false) => {
  if (!uuid) return;

  if (rememberMe) {
    localStorage.setItem('user_uuid', uuid);
    sessionStorage.removeItem('user_uuid');
  } else {
    sessionStorage.setItem('user_uuid', uuid);
    localStorage.removeItem('user_uuid');
  }
};

userApi.interceptors.request.use((config) => {
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

userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/admin')) {
      clearAuthData();
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const signupUser = async (payload) => {
  return userApi.post('/users/signup', payload);
};

export const loginUser = async (payload) => {
  return userApi.post('/users/login', payload);
};

export const resendVerificationEmail = (email) => userApi.post('/email/resend', { email });

export const verifyEmailCode = (email, code) => userApi.post('/email/verify-code', { email, code });

export const forgotPasswordUser = async (payload) => {
  return userApi.post('/users/forgot-password', payload);
};

export const resetPasswordUser = async (payload) => {
  return userApi.post('/users/reset-password', payload);
};

// ── Profile ───────────────────────────────────────────────────────────────────

export const fetchUserProfile = () => userApi.get('/users/profile').then(extractPayload);

export const updateUserProfile = ({ payload = {}, avatarFile = null }) => {
  if (avatarFile) {
    const form = new FormData();
    form.append('_method', 'PUT');
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, value);
      }
    });
    form.append('profile_file', avatarFile);
    return userApi.post('/users/profile', form);
  }
  return userApi.put('/users/profile', payload);
};

export const logoutUser = () => userApi.post('/users/logout');

// ── Student Verification ───────────────────────────────────────────────────────

export const fetchStudentStatus = () => userApi.get('/users/student-status').then(extractPayload);

export const submitStudentVerification = (formData) =>
  userApi.post('/users/student-verification', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(extractPayload);

export default userApi;
