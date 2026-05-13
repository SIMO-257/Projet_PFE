import clientApi from './clientService';

const extractPayload = (response) => response?.data?.data ?? null;

export const fetchClientHome = () => clientApi.get('/home').then(extractPayload);
