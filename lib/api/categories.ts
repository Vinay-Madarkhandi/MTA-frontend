import { apiClient } from '../api-client';
import { ApiResponse } from '../../types';
import { DEMO_MODE, mockApi } from '../mockData';

export interface Category {
  id: number;
  name: string;
  description?: string;
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
}

export interface SubcategoryCommand {
  name: string;
  categoryId: number;
  description?: string;
}

// Mock data for categories and subcategories
const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Grains',
    description: 'Cereal grains and crops',
    subcategories: [
      { id: 1, name: 'Rice', categoryId: 1, description: 'Various types of rice' },
      { id: 2, name: 'Wheat', categoryId: 1, description: 'Wheat varieties' },
      { id: 3, name: 'Corn', categoryId: 1, description: 'Corn and maize' },
    ],
  },
  {
    id: 2,
    name: 'Fertilizers',
    description: 'Plant nutrition products',
    subcategories: [
      { id: 4, name: 'Organic', categoryId: 2, description: 'Organic fertilizers' },
      { id: 5, name: 'Chemical', categoryId: 2, description: 'Chemical fertilizers' },
    ],
  },
  {
    id: 3,
    name: 'Equipment',
    description: 'Agricultural equipment and tools',
    subcategories: [
      { id: 6, name: 'Machinery', categoryId: 3, description: 'Large machinery' },
      { id: 7, name: 'Tools', categoryId: 3, description: 'Hand tools' },
    ],
  },
  {
    id: 4,
    name: 'Seeds',
    description: 'Plant seeds and saplings',
    subcategories: [
      { id: 8, name: 'Vegetable Seeds', categoryId: 4, description: 'Vegetable seeds' },
      { id: 9, name: 'Fruit Seeds', categoryId: 4, description: 'Fruit seeds' },
    ],
  },
];

export const categoryApi = {
  // Category operations
  getAllCategories: async (): Promise<Category[]> => {
    if (DEMO_MODE) {
      return mockCategories;
    }
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    if (DEMO_MODE) {
      const category = mockCategories.find(c => c.id === id);
      if (!category) throw new Error('Category not found');
      return category;
    }
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  createCategory: async (data: CategoryCommand): Promise<Category> => {
    if (DEMO_MODE) {
      const newCategory: Category = {
        id: Math.max(...mockCategories.map(c => c.id), 0) + 1,
        name: data.name,
        description: data.description,
        subcategories: [],
      };
      mockCategories.push(newCategory);
      return newCategory;
    }
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: number, data: CategoryCommand): Promise<Category> => {
    if (DEMO_MODE) {
      const category = mockCategories.find(c => c.id === id);
      if (!category) throw new Error('Category not found');
      category.name = data.name;
      category.description = data.description;
      return category;
    }
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    if (DEMO_MODE) {
      const index = mockCategories.findIndex(c => c.id === id);
      if (index !== -1) {
        mockCategories.splice(index, 1);
      }
      return;
    }
    await apiClient.delete(`/categories/${id}`);
  },

  // Subcategory operations
  getSubcategoriesByCategory: async (categoryId: number): Promise<Subcategory[]> => {
    if (DEMO_MODE) {
      const category = mockCategories.find(c => c.id === categoryId);
      return category?.subcategories || [];
    }
    const response = await apiClient.get<ApiResponse<Subcategory[]>>(`/categories/${categoryId}/subcategories`);
    return response.data.data;
  },

  createSubcategory: async (data: SubcategoryCommand): Promise<Subcategory> => {
    if (DEMO_MODE) {
      const category = mockCategories.find(c => c.id === data.categoryId);
      if (!category) throw new Error('Category not found');
      
      const newSubcategory: Subcategory = {
        id: Math.max(...mockCategories.flatMap(c => c.subcategories || []).map(s => s.id), 0) + 1,
        name: data.name,
        categoryId: data.categoryId,
        description: data.description,
      };
      
      if (!category.subcategories) {
        category.subcategories = [];
      }
      category.subcategories.push(newSubcategory);
      return newSubcategory;
    }
    const response = await apiClient.post<ApiResponse<Subcategory>>('/subcategories', data);
    return response.data.data;
  },

  updateSubcategory: async (id: number, data: SubcategoryCommand): Promise<Subcategory> => {
    if (DEMO_MODE) {
      const subcategory = mockCategories
        .flatMap(c => c.subcategories || [])
        .find(s => s.id === id);
      if (!subcategory) throw new Error('Subcategory not found');
      subcategory.name = data.name;
      subcategory.description = data.description;
      return subcategory;
    }
    const response = await apiClient.put<ApiResponse<Subcategory>>(`/subcategories/${id}`, data);
    return response.data.data;
  },

  deleteSubcategory: async (id: number): Promise<void> => {
    if (DEMO_MODE) {
      for (const category of mockCategories) {
        const index = category.subcategories?.findIndex(s => s.id === id);
        if (index !== undefined && index !== -1) {
          category.subcategories?.splice(index, 1);
          return;
        }
      }
      return;
    }
    await apiClient.delete(`/subcategories/${id}`);
  },
};
