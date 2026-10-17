import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { googleLogout } from '@react-oauth/google';
import { AuthContext, type AuthStatus } from './AuthContext';
import {
  loginWithGoogle,
  logoutSession,
  refreshSession,
  setSessionExpiredHandler,
} from '../services/api';
import type { User } from '../types/chat';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let active = true;

    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus('signedOut');
    });

    // Restore the session from the refresh-token cookie on page load
    refreshSession()
      .then(({ user }) => {
        if (!active) return;
        setUser(user);
        setStatus('signedIn');
      })
      .catch(() => {
        if (active) setStatus('signedOut');
      });

    return () => {
      active = false;
      setSessionExpiredHandler(null);
    };
  }, []);

  const signIn = useCallback(async (credential: string) => {
    const { user } = await loginWithGoogle(credential);
    setUser(user);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    // sign out locally even if the server can't be reached
    await logoutSession().catch(() => undefined);
    googleLogout();
    setUser(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo(
    () => ({ user, status, signIn, signOut }),
    [user, status, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
