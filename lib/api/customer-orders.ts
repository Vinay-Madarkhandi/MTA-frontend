import { apiClient } from '../api-client';
import { CustomerOrder, OrderCommand, OrderItem, ApiResponse } from '@/types';

export const customerOrderApi = {
  // Get all orders
  getAll: async (): Promise<CustomerOrder[]> => {
    const response = await apiClient.get<ApiResponse<CustomerOrder[]>>('/orders');
    return response.data.data;
  },

  // Get order by ID
  getById: async (id: number): Promise<CustomerOrder> => {
    const response = await apiClient.get<ApiResponse<CustomerOrder>>(`/orders/${id}`);
    return response.data.data;
  },

  // Get orders by customer ID
  getByCustomerId: async (customerId: number): Promise<CustomerOrder[]> => {
    const response = await apiClient.get<ApiResponse<CustomerOrder[]>>(`/orders/customer/${customerId}`);
    return response.data.data;
  },

  // Create new order
  create: async (order: OrderCommand): Promise<CustomerOrder> => {
    const response = await apiClient.post<ApiResponse<CustomerOrder>>('/orders', order);
    return response.data.data;
  },

  // Update order status
  updateStatus: async (
    id: number, 
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
  ): Promise<CustomerOrder> => {
    const response = await apiClient.put<ApiResponse<CustomerOrder>>(`/orders/${id}/status`, { status });
    return response.data.data;
  },

  // Delete order
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },

  // Get orders by date range
  getByDateRange: async (startDate: string, endDate: string): Promise<CustomerOrder[]> => {
    const response = await apiClient.get<ApiResponse<CustomerOrder[]>>(
      `/orders/date-range?start=${startDate}&end=${endDate}`
    );
    return response.data.data;
  },

  // Get order statistics
  getStats: async (): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersToday: number;
    revenueToday: number;
  }> => {
    const response = await apiClient.get<ApiResponse<{
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      ordersToday: number;
      revenueToday: number;
    }>>('/orders/stats');
    return response.data.data;
  }
};
