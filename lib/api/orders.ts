import { apiClient } from '../api-client';
import {
  ApiResponse,
  Order,
  OrderCommand,
  DashboardStats,
} from '@/types';

export const orderApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders');
    return response.data.data;
  },

  getRecent: async (limit = 20): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>(`/orders/recent?limit=${limit}`);
    return response.data.data;
  },

  create: async (data: OrderCommand): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data.data;
  },

  getTodaysStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/orders/stats/today');
    return response.data.data;
  },
};
