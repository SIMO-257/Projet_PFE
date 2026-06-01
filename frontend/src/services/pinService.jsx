import userApi from './userService';

export const setPin = (pin, password) =>
    userApi.post('/users/pin/set', { pin, password }).then(r => r.data);

export const verifyPin = (pin) =>
    userApi.post('/users/pin/verify', { pin }).then(r => r.data);

export const disablePin = (pin) =>
    userApi.post('/users/pin/disable', { pin }).then(r => r.data);

export const getPinStatus = () =>
    userApi.get('/users/pin/status').then(r => r.data);
