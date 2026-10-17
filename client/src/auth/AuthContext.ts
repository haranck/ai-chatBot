import { createContext, useContext } from 'react';
import type { User } from '../types/chat';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  signIn: (googleCredential: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
