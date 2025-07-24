/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext } from 'react';
import type { User } from '../utils';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
