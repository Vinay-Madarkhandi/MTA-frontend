import { apiClient } from '../api-client';
import {
  ApiResponse,
  Order,
  OrderCommand,
  DashboardStats,
} from '../../types';
import { DEMO_MODE, mockApi } from '../mockData';

export const orderApi = {
  getAll: async (): Promise<Order[]> => {
    if (DEMO_MODE) {
      return mockApi.getOrders();
    }
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders');
    return response.data.data;
  },

  getRecent: async (limit = 20): Promise<Order[]> => {
    if (DEMO_MODE) {
      const orders = await mockApi.getOrders();
      return orders.slice(0, limit);
    }
    const response = await apiClient.get<ApiResponse<Order[]>>(`/orders/recent?limit=${limit}`);
    return response.data.data;
  },

  create: async (data: OrderCommand): Promise<Order> => {
    if (DEMO_MODE) {
      return mockApi.createOrder(data);
    }
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data.data;
  },

  getTodaysStats: async (): Promise<DashboardStats> => {
    if (DEMO_MODE) {
      return mockApi.getDashboardStats();
    }
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/orders/stats/today');
    return response.data.data;
  },
};
