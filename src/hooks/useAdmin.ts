import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'prompt_library_admin_unlocked';

export function useAdmin() {
  const adminPasskey = import.meta.env.VITE_ADMIN_PASSKEY || 'admin123';
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') {
        setIsAdmin(true);
      }
    } catch {
      // Storage access blocked or unavailable
    }
  }, []);

  const unlockAdmin = useCallback(
    (inputPasskey: string): boolean => {
      const cleanInput = inputPasskey.trim();
      if (cleanInput && cleanInput === adminPasskey.trim()) {
        setIsAdmin(true);
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
        } catch {
          // Ignore storage errors
        }
        return true;
      }
      return false;
    },
    [adminPasskey]
  );

  const lockAdmin = useCallback(() => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return {
    isAdmin,
    unlockAdmin,
    lockAdmin,
    adminPasskeyConfigured: Boolean(import.meta.env.VITE_ADMIN_PASSKEY),
  };
}
