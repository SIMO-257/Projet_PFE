import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { getAuthToken } from './userService';

// Prefer globalThis over window for wider environment compatibility
if (typeof globalThis !== 'undefined') {
  globalThis.Pusher = Pusher;
} else if (typeof opencode !== 'undefined') {
  window.Pusher = Pusher;
}

let echoInstance = null;

/**
 * Initialize the Laravel Echo instance for Pusher WebSocket connection.
 * Must be called when the user is authenticated so private channels can be authorized.
 */
export function initEcho() {
  if (echoInstance) {
    return echoInstance;
  }

  const configuredApiBase = import.meta.env.VITE_API_URL || '';
  const apiBase = configuredApiBase.replace(/\/+$/, '');

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],

    // Auth endpoint for private channels
    authEndpoint: `${apiBase}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        Accept: 'application/json',
      },
    },
  });
  return echoInstance;
}

/**
 * Get the current Echo instance if it exists.
 */
export function getEcho() {
  return echoInstance;
}

/**
 * Disconnect Echo and clean up.
 */
export function destroyEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

export default { initEcho, getEcho, destroyEcho };
