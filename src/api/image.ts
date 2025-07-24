/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './client';

export interface ImageData {
  name: string;
  folder?: string | null;
  image: File;
}

export const uploadImage = async (data: FormData) => {
  return apiClient.post('/images', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getImages = async (folderId?: string, search?: string) => {
  const params = new URLSearchParams();
  if (folderId) params.append('folder', folderId);
  if (search) params.append('search', search);
  return apiClient.get(`/images?${params.toString()}`) as any;
};

export const searchImages = async (query: string) => {
  return apiClient.get(`/images/search?q=${query}`);
};

export const deleteImage = async (id: string) => {
  return apiClient.delete(`/images/${id}`);
};