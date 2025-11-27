import { apiClient } from '../api-client';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '../../types';
import { DEMO_MODE, mockApi } from '../mockData';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    if (DEMO_MODE) {
      return mockApi.login(data.email, data.password);
    }
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    if (DEMO_MODE) {
      return mockApi.register(data);
    }
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  getCurrentUser: async (email: string): Promise<User> => {
    if (DEMO_MODE) {
      return mockApi.getCurrentUser();
    }
    const response = await apiClient.get<ApiResponse<User>>(`/auth/me?email=${email}`);
    return response.data.data;
  },
};
