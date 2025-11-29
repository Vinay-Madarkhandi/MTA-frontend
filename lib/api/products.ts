import { apiClient } from '../api-client';
import {
  ApiResponse,
  Product,
  ProductCommand,
  InventorySummary,
} from '../../types';
import { DEMO_MODE, mockApi } from '../mockData';

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    if (DEMO_MODE) {
      const products = await mockApi.getProducts();
      return products.map(product => ({
        ...product,
        currentStock: product.stock,
      }));
    }
    const response = await apiClient.get<ApiResponse<Product[]>>('/products');
    return response.data.data;
  },

  getById: async (id: number): Promise<Product> => {
    if (DEMO_MODE) {
      const product = await mockApi.getProductById(id);
      if (!product) throw new Error('Product not found');
      return { ...product, currentStock: product.stock };
    }
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  getBySku: async (sku: string): Promise<Product> => {
    if (DEMO_MODE) {
      const products = await mockApi.getProducts();
      const product = products.find(p => p.sku === sku);
      if (!product) throw new Error('Product not found');
      return { ...product, currentStock: product.stock };
    }
    const response = await apiClient.get<ApiResponse<Product>>(`/products/sku/${sku}`);
    return response.data.data;
  },

  create: async (data: ProductCommand): Promise<Product> => {
    if (DEMO_MODE) {
      return mockApi.createProduct(data);
    }
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.data.data;
  },

  update: async (id: number, data: ProductCommand): Promise<Product> => {
    if (DEMO_MODE) {
      const updatedProduct = await mockApi.updateProduct(id, data);
      return { ...updatedProduct, currentStock: updatedProduct.stock };
    }
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (DEMO_MODE) {
      return mockApi.deleteProduct(id);
    }
    await apiClient.delete(`/products/${id}`);
  },

  adjustStock: async (id: number, data: { addStock: number; reduceStock: number }): Promise<Product> => {
    if (DEMO_MODE) {
      const product = await mockApi.getProductById(id);
      if (!product) throw new Error('Product not found');
      const newStock = product.stock + data.addStock - data.reduceStock;
      const updatedProduct = await mockApi.updateProduct(id, { stock: newStock });
      return { ...updatedProduct, currentStock: updatedProduct.stock };
    }
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/stock`, data);
    return response.data.data;
  },

  getSummary: async (): Promise<InventorySummary> => {
    if (DEMO_MODE) {
      return mockApi.getInventorySummary();
    }
    const response = await apiClient.get<ApiResponse<InventorySummary>>('/products/summary');
    return response.data.data;
  },
};
