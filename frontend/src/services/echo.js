import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { getAuthToken } from './userService';

window.Pusher = Pusher;

let echoInstance = null;

/**
 * Initialize the Laravel Echo instance for Reverb WebSocket connection.
 * Must be called when the user is authenticated so private channels can be authorized.
 */
export function initEcho() {
  if (echoInstance) {
    return echoInstance;
  }

  const configuredApiBase = import.meta.env.VITE_API_URL || '';
  const apiBase = configuredApiBase.replace(/\/+$/, '');

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],

    // ── Private channel authentication ──
    // Echo will POST to /broadcasting/auth with the channel name.
    // The backend uses Sanctum, so we send the Bearer token in the auth request.
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
