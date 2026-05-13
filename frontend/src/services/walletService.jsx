import clientApi from './clientService';

const extractPayload = (response) => response?.data?.data ?? null;

export const fetchWalletDetails = () => clientApi.get('/wallet').then(extractPayload);

export const fetchTransactionHistory = () => clientApi.get('/wallet/transactions').then(extractPayload);

export const initRecharge = (payload) => clientApi.post('/wallet/recharge/init', payload);

export const confirmRecharge = (payload) => clientApi.post('/wallet/recharge/confirm', payload);

export const createPaymentIntent = (payload) => clientApi.post('/payments/create-intent', payload);

export const saveBillingDetails = (payload) => clientApi.post('/payments/billing-details', payload);
