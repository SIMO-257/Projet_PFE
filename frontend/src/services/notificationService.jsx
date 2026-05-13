import clientApi from './clientService';

const extractPayload = (response) => response?.data?.data ?? null;

export const getNotifications = (type = 'all', page = 1) =>
    clientApi.get('/notifications', { params: { type, page } }).then(extractPayload);

export const getUnreadCount = () =>
    clientApi.get('/notifications/unread-count').then(extractPayload);

export const markRead = (id) =>
    clientApi.patch(`/notifications/${id}/read`).then(extractPayload);

export const markAllRead = () =>
    clientApi.patch('/notifications/read-all').then(extractPayload);

export const deleteNotification = (id) =>
    clientApi.delete(`/notifications/${id}`).then(extractPayload);

export const logFailure = (payload) =>
    clientApi.post('/notifications/log-failure', payload).then(extractPayload);

export const updateFcmToken = (token) =>
    clientApi.put('/user/fcm-token', { fcm_token: token }).then(extractPayload);

export const getNotificationPreferences = () =>
    clientApi.get('/user/notification-preferences').then(extractPayload);

export const updateNotificationPreferences = (preferences) =>
    clientApi.patch('/user/notification-preferences', { preferences }).then(extractPayload);

export const getClientPreferences = () =>
    clientApi.get('/user/preferences').then(extractPayload);

export const updateClientPreferences = (preferences) =>
    clientApi.patch('/user/preferences', preferences).then(extractPayload);
