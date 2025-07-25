import axios from 'axios';
import { getToken } from '../utils/auth';


const API_BASE_URL = 'https://fileuploadbackend-0fbn.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;