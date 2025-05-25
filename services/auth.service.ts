import api from './axios.config';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/User';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async register(email: string, password: string, name: string, phone: string): Promise<string> {
    try {
      const response = await api.post('/auth/register', { email, password, name, phone });
      const token = response.data?.token || response.data; // Phòng trường hợp chỉ trả về token
      await SecureStore.setItemAsync('userToken', token);
      return token;
    } catch (error: any) {
      console.error('Registration API error:', error.response?.data || error.message);
      throw error;
    }
  },
async login(email: string, password: string): Promise<{ token: string; user: User }> {
  try {
    console.log('Login API request to:', api.defaults.baseURL + '/auth/login');
    console.log('Request payload:', { email, password });
    
    const response = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('userId', response.data.user.id);
    console.log('Login API response:', response.data);

    await SecureStore.setItemAsync('userToken', response.data.token);
    return response.data;
  } catch (error: any) {
    console.error('Login API error:', error.response?.data || error.message);
    throw error;
  }
},


  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('userToken');
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('userToken');
  }
};
