import api from '../api/axiosConfig';
import type { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '../types/menu.types';


export const menuService = {

  getMenuItems: async (restaurantId: number): Promise<MenuItem[]> => {
    const response = await api.get(`/api/menu/restaurant/${restaurantId}`);
    return response.data;
  },

  getAvailableItems: async (restaurantId: number): Promise<MenuItem[]> => {
    const response = await api.get(`/api/menu/restaurant/${restaurantId}/available`);
    return response.data;
  },

  getItemsByCategory: async (restaurantId: number, category: string): Promise<MenuItem[]> => {
    const response = await api.get(`/api/menu/restaurant/${restaurantId}/category/${category}`);
    return response.data;
  },

  getMenuItemById: async (id: number): Promise<MenuItem> => {
    const response = await api.get(`/api/menu/items/${id}`);
    return response.data;
  },

  addMenuItem: async (data: CreateMenuItemRequest): Promise<MenuItem> => {
    const response = await api.post('/api/menu/items', data);
    return response.data;
  },

  updateMenuItem: async (id: number, data: UpdateMenuItemRequest): Promise<MenuItem> => {
    const response = await api.put(`/api/menu/items/${id}`, data);
    return response.data;
  },

  toggleAvailability: async (id: number): Promise<MenuItem> => {
    const response = await api.patch(`/api/menu/items/${id}/availability`);
    return response.data;
  },

  deleteMenuItem: async (id: number): Promise<void> => {
    await api.delete(`/api/menu/items/${id}`);
  },

};
