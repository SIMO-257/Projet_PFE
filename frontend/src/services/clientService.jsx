import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL ?? '';

const clientApi = axios.create({
  baseURL: `${apiBase}/api`,
  withCredentials: false,
});

export const getAuthToken = () =>
  localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');

export const getClientUuid = () =>
  localStorage.getItem('client_uuid') ?? sessionStorage.getItem('client_uuid');

export const setAuthToken = (token, rememberMe = false) => {
  if (!token) return;

  if (rememberMe) {
    localStorage.setItem('auth_token', token);
    sessionStorage.removeItem('auth_token');
  } else {
    sessionStorage.setItem('auth_token', token);
    localStorage.removeItem('auth_token');
  }
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
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
  localStorage.removeItem('client_uuid');
  sessionStorage.removeItem('client_uuid');
};

clientApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signupClient = (payload) => clientApi.post('/signup', payload);

export const loginClient = (payload) => clientApi.post('/login', payload);

export const forgotPasswordClient = (payload) =>
  clientApi.post('/forgot-password', payload);

export const resetPasswordClient = (payload) =>
  clientApi.post('/reset-password', payload);

export const fetchClientProfile = () => clientApi.get('/profile');

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

export const fetchClientHome = () => clientApi.get('/home');

export default clientApi;
