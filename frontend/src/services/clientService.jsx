import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL ?? '';

const clientApi = axios.create({
  baseURL: `${apiBase}/api`,
  withCredentials: false,
});

export const signupClient = (payload) => clientApi.post('/signup', payload);

export const loginClient = (payload) => clientApi.post('/login', payload);

export const forgotPasswordClient = (payload) =>
  clientApi.post('/forgot-password', payload);

export const fetchClientProfile = ({ uuid } = {}) =>
  clientApi.get('/profile', {
    params: uuid ? { uuid } : undefined,
    headers: uuid ? { 'X-Client-UUID': uuid } : undefined,
  });

export const uploadClientAvatar = ({ uuid, avatarFile }) => {
  const form = new FormData();
  form.append('avatar', avatarFile);

  return clientApi.post('/profile/avatar', form, {
    headers: {
      'X-Client-UUID': uuid,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateClientProfile = ({ uuid, payload }) =>
  clientApi.put('/profile', payload, {
    headers: { 'X-Client-UUID': uuid },
  });

export const logoutClient = ({ uuid } = {}) =>
  clientApi.post('/logout', uuid ? { uuid } : {});

export const fetchClientHome = () => clientApi.get('/home');

export default clientApi;
