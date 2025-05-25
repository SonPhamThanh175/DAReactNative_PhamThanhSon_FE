import api from './axios.config';
import { Property } from '../types/Property';

export const propertiesService = {
  async createProperty(data: Omit<Property, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    try {
      const response = await api.post('/properties', data);
      return response.data;
    } catch (error: any) {
      console.error('Create property API error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getAllProperties(): Promise<Property> {
    try {
      const response = await api.get('/properties');
      return response.data;
    } catch (error: any) {
      console.error('Get all properties API error:', error.response?.data || error.message);
      throw error;
    }
  },

  getPropertiesByUser: async (userId: string): Promise<Property[]> => {
    const res = await api.get(`/properties/user/${userId}`);
    return res.data;
  },
  async getPropertyById(id: string): Promise<Property> {  
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Get property by ID (${id}) API error:`, error.response?.data || error.message);
      throw error;
    }
  },

  async updateProperty(id: string, data: Partial<Omit<Property, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Property> {
    try {
      const response = await api.put(`/properties/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Update property (${id}) API error:`, error.response?.data || error.message);
      throw error;
    }
  },

  async deleteProperty(id: string): Promise<Property> {
    try {
      const response = await api.delete(`/properties/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Delete property (${id}) API error:`, error.response?.data || error.message);
      throw error;
    }
  }
};