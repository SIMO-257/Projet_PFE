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
 * Initialize the Laravel Echo instance for Reverb WebSocket connection.
 * Must be called when the user is authenticated so private channels can be authorized.
 */
export function initEcho() {
  if (echoInstance) {
    return echoInstance;
  }

  const configuredApiBase = import.meta.env.VITE_API_URL || '';
  const apiBase = configuredApiBase.replace(/\/+$/, '');

  // echoInstance = new Echo({
  //   broadcaster: 'reverb',
  //   key: import.meta.env.VITE_REVERB_APP_KEY,
  //   wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
  //   wsPort: import.meta.env.VITE_REVERB_PORT || window.location.port || 80,
  //   wssPort: import.meta.env.VITE_REVERB_PORT || 443,
  //   forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
  //   enabledTransports: ['ws', 'wss'],

  //   // ── Private channel authentication ──
  //   // Echo will POST to /broadcasting/auth with the channel name.
  //   // The backend uses Sanctum, so we send the Bearer token in the auth request.
  //   authEndpoint: `${apiBase}/broadcasting/auth`,
  //   auth: {
  //     headers: {
  //       Authorization: `Bearer ${getAuthToken()}`,
  //       Accept: 'application/json',
  //     },
  //   },
  // });
  echoInstance = new Echo({
    broadcaster: 'reverb',
    // 1. Make sure your React app has access to this key!
    key: import.meta.env.VITE_REVERB_APP_KEY, 
    
    // 2. Dynamically use the current domain name
    wsHost: window.location.hostname,
    
    // 3. Force port 443 in production (HTTPS) or 8080 in local dev
    wsPort: window.location.protocol === 'https:' ? 443 : 8080,
    wssPort: window.location.protocol === 'https:' ? 443 : 8080,
    
    // 4. Force secure connection if on production
    forceTLS: window.location.protocol === 'https:',
    enabledTransports: ['ws', 'wss'],
    
    // 5. THE MISSING LINK: This forces the connection to use your /app prefix
    wsPath: '/app', 
    
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
