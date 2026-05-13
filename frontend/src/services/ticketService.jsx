import clientApi from './clientService';

const extractPayload = (response) => response?.data?.data ?? null;

export const fetchTicketTypes = () => clientApi.get('/ticket-types').then(extractPayload);

export const purchaseTicket = (payload) => clientApi.post('/tickets/purchase', payload);

export const fetchMyTickets = () => clientApi.get('/tickets').then(extractPayload);

export const fetchPurchasedCards = () => clientApi.get('/tickets/cards').then(extractPayload);

export const setDefaultPurchasedCard = (ticketId) =>
  clientApi.post('/tickets/cards/default', { ticket_id: ticketId }).then(extractPayload);

export const fetchTicketDetails = (uuid) => clientApi.get(`/tickets/${uuid}`).then(extractPayload);

export const validateTicket = (uuid, payload) => clientApi.post(`/tickets/${uuid}/validate`, payload);

export const createNfcChallenge = () => clientApi.post('/tickets/nfc/challenge').then(extractPayload);

export const consumeNfcChallenge = (payload) =>
  clientApi.post('/tickets/nfc/consume', payload).then(extractPayload);

export const createQrValidationToken = (payload) =>
  clientApi.post('/tickets/qr/token', payload).then(extractPayload);

export const consumeQrValidationToken = (payload) =>
  clientApi.post('/tickets/qr/consume', payload).then(extractPayload);
