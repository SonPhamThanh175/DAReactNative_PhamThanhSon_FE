import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// const API_URL = "http://172.20.10.10:3000/api";
const API_URL = "http://192.168.1.129:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request detected. User might need to re-authenticate.');
      // In a real application, you might trigger a logout or redirect to login here.
      // This would typically be handled by the AuthContext or a global navigation listener.
    }
    return Promise.reject(error);
  }
);

export default api;