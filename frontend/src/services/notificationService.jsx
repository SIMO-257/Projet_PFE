import userApi from './userService';

const extractPayload = (response) => response?.data?.data ?? null;

export const getNotifications = (type = 'all', page = 1) =>
    userApi.get('/notifications', { params: { type, page } }).then(extractPayload);

export const getUnreadCount = () =>
    userApi.get('/notifications/unread-count').then(extractPayload);

export const markRead = (id) =>
    userApi.patch(`/notifications/${id}/read`).then(extractPayload);

export const markAllRead = () =>
    userApi.patch('/notifications/read-all').then(extractPayload);

export const deleteNotification = (id) =>
    userApi.delete(`/notifications/${id}`).then(extractPayload);

export const logFailure = (payload) =>
    userApi.post('/notifications/log-failure', payload).then(extractPayload);

export const updateFcmToken = (token) =>
    userApi.put('/users/fcm-token', { fcm_token: token }).then(extractPayload);

export const getNotificationPreferences = () =>
    userApi.get('/users/notification-preferences').then(extractPayload);

export const updateNotificationPreferences = (preferences) =>
    userApi.patch('/users/notification-preferences', { preferences }).then(extractPayload);

export const getUserPreferences = () =>
    userApi.get('/users/preferences').then(extractPayload);

export const updateUserPreferences = (preferences) =>
    userApi.patch('/users/preferences', preferences).then(extractPayload);
