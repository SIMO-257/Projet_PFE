import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initEcho, destroyEcho, getEcho } from '../services/echo';
import { getWalletData, updateBalance } from '../Redux/Slices/WalletSlice';
import { getTicketsData } from '../Redux/Slices/TicketsSlice';
import { fetchUnreadCount, fetchNotifications } from '../Redux/Slices/notificationSlice';

/**
 * useRealtime — sets up a persistent Laravel Echo WebSocket connection
 * that listens for events on the authenticated user's private channel
 * and dispatches Redux actions to keep the UI up-to-date in real time.
 *
 * Call this once at the top of the root App component.
 */
export function useRealtime() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const echoRef = useRef(null);

  useEffect(() => {
    // Only connect if the user is authenticated and has an ID
    if (!isAuthenticated || !user?.id) {
      // Clean up if logged out
      if (echoRef.current) {
        destroyEcho();
        echoRef.current = null;
      }
      return;
    }

    // Initialize Echo if not already connected
    let echo = getEcho();
    if (!echo) {
      echo = initEcho();
    }
    echoRef.current = echo;

    const channelName = `user.${user.id}`;
    const channel = echo.private(channelName);

    // ── Global: ticket types updated (create, update, toggle, delete) ──
    const ticketTypesChannel = echo.channel('ticket-types');
    ticketTypesChannel.listen('.ticket-type.updated', (e) => {
      console.log('[WS] ticket-type.updated:', e);
      dispatch(getTicketsData());
    });

    // ── Ticket purchased ──
    channel.listen('.ticket.purchased', (e) => {
      console.log('[WS] ticket.purchased:', e);
      dispatch(getTicketsData());
      dispatch(getWalletData());
      if (e.new_balance !== undefined) {
        dispatch(updateBalance(e.new_balance));
      }
    });

    // ── Ticket validated ──
    channel.listen('.ticket.validated', (e) => {
      console.log('[WS] ticket.validated:', e);
      dispatch(getTicketsData());
      dispatch(getWalletData());
    });

    // ── Balance updated (recharge, purchase, or low balance) ──
    channel.listen('.balance.updated', (e) => {
      console.log('[WS] balance.updated:', e);
      if (e.balance !== undefined) {
        dispatch(updateBalance(e.balance));
      }
      dispatch(getWalletData());
    });

    // ── New notification ──
    channel.listen('.notification.new', (e) => {
      console.log('[WS] notification.new:', e);
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications('all'));
    });

    // Cleanup: leave channel on unmount or auth change (removes all listeners automatically)
    return () => {
      try {
        echo.leave(channelName);
        echo.leave('ticket-types');
      } catch (err) {
        // Ignore cleanup errors
      }
    };
  }, [dispatch, isAuthenticated, user?.id]);
}

export default useRealtime;
