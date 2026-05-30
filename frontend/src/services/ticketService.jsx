import userApi from './userService';

const extractPayload = (response) => response?.data?.data ?? null;

export const fetchTicketTypes = () => userApi.get('/ticket-types').then(extractPayload);

export const purchaseTicket = (payload) => userApi.post('/tickets/purchase', payload);

export const fetchMyTickets = () => userApi.get('/tickets').then(extractPayload);

export const fetchPurchasedCards = () => userApi.get('/tickets/cards').then(extractPayload);

export const setDefaultPurchasedCard = (ticketId) =>
  userApi.post('/tickets/cards/default', { ticket_id: ticketId }).then(extractPayload);

export const fetchTicketDetails = (uuid) => userApi.get(`/tickets/${uuid}`).then(extractPayload);

export const validateTicket = (uuid, payload) => userApi.post(`/tickets/${uuid}/validate`, payload);

export const createNfcChallenge = () => userApi.post('/tickets/nfc/challenge').then(extractPayload);

export const consumeNfcChallenge = (payload) =>
  userApi.post('/tickets/nfc/consume', payload).then(extractPayload);

export const createQrValidationToken = (payload) =>
  userApi.post('/tickets/qr/token', payload).then(extractPayload);

export const consumeQrValidationToken = (payload) =>
  userApi.post('/tickets/qr/consume', payload).then(extractPayload);
