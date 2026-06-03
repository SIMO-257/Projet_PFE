import { useState, useEffect } from 'react';
import { getPinStatus } from '../services/pinService';

export default function usePinGuard() {
  const [checking, setChecking] = useState(true);
  const [isPinEnabled, setIsPinEnabled] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const pinStatus = await getPinStatus();
        const ps = pinStatus?.data || pinStatus;
        setIsPinEnabled(ps?.pin_enabled ?? false);
      } catch (err) {
        console.error('usePinGuard: Failed to check PIN status', err);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, []);

  return { checking, isPinEnabled };
}
