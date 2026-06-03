import userApi from './userService';

const extractPayload = (response) => response?.data?.data ?? null;

export const fetchWalletDetails = () => userApi.get('/wallet').then(extractPayload);

export const fetchTransactionHistory = () => userApi.get('/wallet/transactions').then(extractPayload);

export const initRecharge = (payload) => userApi.post('/wallet/recharge/init', payload);

export const confirmRecharge = (payload) => userApi.post('/wallet/recharge/confirm', payload);

export const createPaymentIntent = (payload) => userApi.post('/payments/create-intent', payload);

export const cancelPaymentIntent = (paymentIntentId) => userApi.post('/payments/cancel-intent', { payment_intent_id: paymentIntentId });

export const saveBillingDetails = (payload) => userApi.post('/payments/billing-details', payload);
