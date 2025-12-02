import { apiClient } from '../api-client';
import { Product, NearExpiryProduct, ExpiryStats, ExpiryAlertThreshold, ApiResponse } from '@/types';

/**
 * Expiry API - Handles all expiry-related API calls
 * All expiry data is managed by the backend
 */
export const expiryApi = {
  // Get all products with near expiry status
  getNearExpiryProducts: async (): Promise<NearExpiryProduct[]> => {
    const response = await apiClient.get<ApiResponse<NearExpiryProduct[]>>('/expiry/near-expiry');
    return response.data.data;
  },

  // Get only products that are expired or near expiry (alerts only)
  getAlertsOnly: async (): Promise<NearExpiryProduct[]> => {
    const response = await apiClient.get<ApiResponse<NearExpiryProduct[]>>('/expiry/alerts');
    return response.data.data;
  },

  // Get expiry statistics
  getExpiryStats: async (): Promise<ExpiryStats> => {
    const response = await apiClient.get<ApiResponse<ExpiryStats>>('/expiry/stats');
    return response.data.data;
  },

  // Update expiry date for a product
  updateExpiryDate: async (
    productId: number,
    expiryDate: string,
    batchNumber?: string,
    manufacturingDate?: string
  ): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/expiry/${productId}`, {
      expiryDate,
      batchNumber,
      manufacturingDate,
    });
    return response.data.data;
  },

  // Get alert thresholds
  getAlertThresholds: async (): Promise<ExpiryAlertThreshold[]> => {
    const response = await apiClient.get<ApiResponse<ExpiryAlertThreshold[]>>('/expiry/thresholds');
    return response.data.data;
  },

  // Update alert threshold
  updateAlertThreshold: async (threshold: ExpiryAlertThreshold): Promise<ExpiryAlertThreshold> => {
    const response = await apiClient.put<ApiResponse<ExpiryAlertThreshold>>(
      `/expiry/thresholds/${threshold.id}`,
      threshold
    );
    return response.data.data;
  },

  // Bulk update expiry dates
  bulkUpdateExpiry: async (updates: Array<{
    productId: number;
    expiryDate: string;
    batchNumber?: string;
    manufacturingDate?: string;
  }>): Promise<void> => {
    await apiClient.post('/expiry/bulk-update', { updates });
  },

  // Remove expiry date from product
  removeExpiryDate: async (productId: number): Promise<void> => {
    await apiClient.delete(`/expiry/${productId}`);
  },
};
