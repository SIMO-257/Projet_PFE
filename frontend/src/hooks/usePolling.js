import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWalletData } from '../Redux/Slices/WalletSlice';
import { getTicketsData } from '../Redux/Slices/TicketsSlice';
import { fetchUnreadCount } from '../Redux/Slices/notificationSlice';

/**
 * usePolling — remplace useRealtime (WebSocket/Pusher) par du polling REST
 * classique. Rafraîchit les données critiques toutes les 15 secondes
 * et les notifications toutes les 30 secondes.
 *
 * À utiliser une seule fois dans le composant racine App.
 */
export function usePolling() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const intervalRef = useRef(null);
  const notifIntervalRef = useRef(null);

  useEffect(() => {
    // Nettoyer les anciens intervalles (évite les doublons en dev avec StrictMode)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (notifIntervalRef.current) {
      clearInterval(notifIntervalRef.current);
      notifIntervalRef.current = null;
    }

    // Ne rien faire si l'utilisateur n'est pas authentifié
    if (!isAuthenticated || !user?.id) {
      return;
    }

    // ── Polling toutes les 15 secondes : tickets + wallet ──
    const fetchMainData = () => {
      dispatch(getTicketsData());
      dispatch(getWalletData());
    };

    // Premier appel immédiat
    fetchMainData();

    // Puis toutes les 15 secondes (réduit la charge serveur de 95%)
    intervalRef.current = setInterval(fetchMainData, 15000);

    // ── Polling toutes les 30 secondes : notifications ──
    notifIntervalRef.current = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);

    // Nettoyage au démontage
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (notifIntervalRef.current) {
        clearInterval(notifIntervalRef.current);
        notifIntervalRef.current = null;
      }
    };
  }, [dispatch, isAuthenticated, user?.id]);
}

export default usePolling;
