import apiClient from './client';

export interface AuthData {
  email: string;
  password: string;
  name?: string;
}

export const register = async (data: AuthData) => {
  return apiClient.post('/auth/register', data);
};

export const login = async (data: AuthData) => {
  return apiClient.post('/auth/login', data);
};

export const logout = async () => {
  return apiClient.get('/auth/logout');
};