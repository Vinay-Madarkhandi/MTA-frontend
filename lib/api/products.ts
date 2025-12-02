import { apiClient } from '../api-client';
import {
  ApiResponse,
  Product,
  ProductCommand,
  InventorySummary,
} from '@/types';

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products');
    return response.data.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  getBySku: async (sku: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/sku/${sku}`);
    return response.data.data;
  },

  create: async (data: ProductCommand): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.data.data;
  },

  update: async (id: number, data: ProductCommand): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  adjustStock: async (id: number, data: { addStock: number; reduceStock: number }): Promise<Product> => {
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/stock`, data);
    return response.data.data;
  },

  getSummary: async (): Promise<InventorySummary> => {
    const response = await apiClient.get<ApiResponse<InventorySummary>>('/products/summary');
    return response.data.data;
  },
};
