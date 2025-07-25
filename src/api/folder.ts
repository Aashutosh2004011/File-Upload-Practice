
import axios from 'axios';

const API_BASE_URL = ' https://fileuploadbackend-0fbn.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getFolderTree = async () => {
  const response = await api.get('/folders/tree');
  return response.data;
};

export const getFolders = async () => {
  const response = await api.get('/folders');
  return response.data;
};

export const getFolder = async (id: string) => {
  const response = await api.get(`/folders/${id}`);
  return response.data;
};

export const createFolder = async (data: { name: string; parentFolder?: string | null }) => {
  const response = await api.post('/folders', {
    name: data.name,
    parentFolder: data.parentFolder || null,
  });
  return response.data;
};

export const deleteFolder = async (id: string) => {
  const response = await api.delete(`/folders/${id}`);
  return response.data;
};

export const updateFolder = async (id: string, data: { name: string }) => {
  const response = await api.put(`/folders/${id}`, data);
  return response.data;
};