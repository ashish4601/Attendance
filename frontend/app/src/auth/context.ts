import type { User } from '@/app/src/auth/auth.types';
import { createContext } from 'react';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  signIn: async () => { },
  signOut: async () => { },
  refreshUser: async () => { },
});
