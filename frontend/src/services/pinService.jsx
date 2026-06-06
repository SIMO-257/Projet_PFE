import userApi from './userService';

export const setPin = (pin, currentPassword) =>
    userApi.post('/users/pin/set', { pin, current_password: currentPassword }).then(r => r.data);

export const verifyPin = (pin) =>
    userApi.post('/users/pin/verify', { pin }).then(r => r.data);

export const disablePin = (pin) =>
    userApi.post('/users/pin/disable', { pin }).then(r => r.data);

export const getPinStatus = () =>
    userApi.get('/users/pin/status').then(r => r.data);

export const resetPin = (currentPassword) =>
    userApi.post('/users/pin/reset', { current_password: currentPassword }).then(r => r.data);

export const setRecoveryEmail = (email, currentPassword, pin) =>
    userApi.post('/users/pin/recovery-email', { email, current_password: currentPassword, pin }).then(r => r.data);

export const getRecoveryEmail = () =>
    userApi.get('/users/pin/recovery-email').then(r => r.data);
