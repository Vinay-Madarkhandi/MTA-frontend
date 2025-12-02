import { apiClient } from '../api-client';
import { ApiResponse, Customer, CustomerCommand, CustomerStats } from '@/types';

/**
 * Customer API - Handles all customer-related API calls
 * Follows Single Responsibility Principle
 */
export const customerApi = {
  // Get all customers
  getAll: async (): Promise<Customer[]> => {
    const response = await apiClient.get<ApiResponse<Customer[]>>('/customers');
    return response.data.data;
  },

  // Get customer by ID
  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data.data;
  },

  // Search customers by name or phone
  search: async (query: string): Promise<Customer[]> => {
    const response = await apiClient.get<ApiResponse<Customer[]>>(`/customers/search?q=${query}`);
    return response.data.data;
  },

  // Create new customer
  create: async (customer: CustomerCommand): Promise<Customer> => {
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', customer);
    return response.data.data;
  },

  // Update customer
  update: async (id: number, customer: CustomerCommand): Promise<Customer> => {
    const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, customer);
    return response.data.data;
  },

  // Delete customer
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },

  // Get customer statistics
  getStats: async (): Promise<CustomerStats> => {
    const response = await apiClient.get<ApiResponse<CustomerStats>>('/customers/stats');
    return response.data.data;
  },

  // Update customer purchase stats (called after order completion)
  updatePurchaseStats: async (customerId: number, orderAmount: number): Promise<void> => {
    await apiClient.post(`/customers/${customerId}/update-stats`, { orderAmount });
  }
};
