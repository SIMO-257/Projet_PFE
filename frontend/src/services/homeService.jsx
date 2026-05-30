import userApi from './userService';

const extractPayload = (response) => response?.data?.data ?? null;

export const fetchClientHome = () => userApi.get('/home').then(extractPayload);
