import { apiClient } from '../api-client';
import { ApiResponse } from '@/types';

/**
 * Category API - Handles all category-related API calls
 * Follows Single Responsibility Principle
 */

export interface Category {
  id: number;
  name: string;
  description?: string;
  path?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
  description?: string;
}

export interface CategoryCommand {
  name: string;
  description?: string;
  path?: string;
}

export interface SubcategoryCommand {
  name: string;
  categoryId: number;
  description?: string;
}

export const categoryApi = {
  // Category operations
  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  createCategory: async (data: CategoryCommand): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: number, data: CategoryCommand): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  // Subcategory operations
  getAllSubcategories: async (): Promise<Subcategory[]> => {
    const response = await apiClient.get<ApiResponse<Subcategory[]>>('/subcategories');
    return response.data.data;
  },

  getSubcategoriesByCategory: async (categoryId: number): Promise<Subcategory[]> => {
    const response = await apiClient.get<ApiResponse<Subcategory[]>>(`/subcategories/category/${categoryId}`);
    return response.data.data;
  },

  createSubcategory: async (data: SubcategoryCommand): Promise<Subcategory> => {
    const response = await apiClient.post<ApiResponse<Subcategory>>('/subcategories', data);
    return response.data.data;
  },

  updateSubcategory: async (id: number, data: SubcategoryCommand): Promise<Subcategory> => {
    const response = await apiClient.put<ApiResponse<Subcategory>>(`/subcategories/${id}`, data);
    return response.data.data;
  },

  deleteSubcategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/subcategories/${id}`);
  },
};
