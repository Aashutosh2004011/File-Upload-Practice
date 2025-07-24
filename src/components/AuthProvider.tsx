import { useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getUser, removeToken, setToken } from '../utils/auth';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth';
import type { User } from '../utils/types';
import { AuthContext } from './AuthContext';
import { useRouter } from '@tanstack/react-router';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin({ email, password });
      const { token } = response.data;
      
      if (token) {
        setToken(token);
        const user = getUser();
        setUser(user);
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await apiRegister({ name, email, password });
    const data = response.data;
    
    if (data.success && data.token) {
      setToken(data.token);
      const user = getUser();
      setUser(user);
      return { success: true, user: data.data.user };
    }
    
    throw new Error('Registration failed');
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      removeToken();
      setUser(null);
      queryClient.clear();
      router.navigate({ to: '/login' });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};