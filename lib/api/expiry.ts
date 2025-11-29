import { apiClient } from '../api-client';
import { Product, NearExpiryProduct, ExpiryStats, ExpiryAlertThreshold } from '@/types';
import { productApi } from './products';

// Check if demo mode is enabled
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Default alert thresholds
const defaultThresholds: ExpiryAlertThreshold[] = [
  { id: 1, name: 'Critical (7 days)', days: 7, color: '#ef4444', enabled: true },
  { id: 2, name: 'Warning (15 days)', days: 15, color: '#f97316', enabled: true },
  { id: 3, name: 'Info (30 days)', days: 30, color: '#eab308', enabled: true },
];

let alertThresholds = [...defaultThresholds];

const calculateDaysUntilExpiry = (expiryDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getExpiryStatus = (daysUntilExpiry: number): 'EXPIRED' | 'NEAR_EXPIRY' | 'SAFE' => {
  if (daysUntilExpiry < 0) return 'EXPIRED';
  const maxThreshold = Math.max(...alertThresholds.filter(t => t.enabled).map(t => t.days));
  if (daysUntilExpiry <= maxThreshold) return 'NEAR_EXPIRY';
  return 'SAFE';
};

const getAlertLevel = (daysUntilExpiry: number): 'CRITICAL' | 'WARNING' | 'INFO' => {
  if (daysUntilExpiry < 0) return 'CRITICAL';
  
  const enabledThresholds = alertThresholds.filter(t => t.enabled).sort((a, b) => a.days - b.days);
  
  for (const threshold of enabledThresholds) {
    if (daysUntilExpiry <= threshold.days) {
      if (threshold.days <= 7) return 'CRITICAL';
      if (threshold.days <= 15) return 'WARNING';
      return 'INFO';
    }
  }
  
  return 'INFO';
};

const enrichProductWithExpiryData = (product: Product): NearExpiryProduct | null => {
  if (!product.expiryDate) return null;
  
  const daysUntilExpiry = calculateDaysUntilExpiry(product.expiryDate);
  const expiryStatus = getExpiryStatus(daysUntilExpiry);
  const alertLevel = getAlertLevel(daysUntilExpiry);
  
  return {
    ...product,
    daysUntilExpiry,
    expiryStatus,
    alertLevel,
  };
};

export const expiryApi = {
  // Get all products with near expiry status
  getNearExpiryProducts: async (): Promise<NearExpiryProduct[]> => {
    if (isDemoMode) {
      const allProducts = await productApi.getAll();
      const productsWithExpiry = allProducts
        .map(enrichProductWithExpiryData)
        .filter((p): p is NearExpiryProduct => p !== null);
      
      // Sort by days until expiry (ascending - nearest first)
      return productsWithExpiry.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    }
    const response = await apiClient.get<NearExpiryProduct[]>('/expiry/near-expiry');
    return response.data;
  },

  // Get only products that are expired or near expiry
  getAlertsOnly: async (): Promise<NearExpiryProduct[]> => {
    if (isDemoMode) {
      const allNearExpiry = await expiryApi.getNearExpiryProducts();
      const maxThreshold = Math.max(...alertThresholds.filter(t => t.enabled).map(t => t.days));
      
      return allNearExpiry.filter(p => 
        p.daysUntilExpiry <= maxThreshold
      );
    }
    const response = await apiClient.get<NearExpiryProduct[]>('/expiry/alerts');
    return response.data;
  },

  // Get expiry statistics
  getExpiryStats: async (): Promise<ExpiryStats> => {
    if (isDemoMode) {
      const allProducts = await productApi.getAll();
      const productsWithExpiry = allProducts.filter(p => p.expiryDate);
      
      let expiredCount = 0;
      let nearExpiryCount = 0;
      let expiryValue = 0;
      
      const maxThreshold = Math.max(...alertThresholds.filter(t => t.enabled).map(t => t.days));
      
      productsWithExpiry.forEach(product => {
        if (product.expiryDate) {
          const days = calculateDaysUntilExpiry(product.expiryDate);
          if (days < 0) {
            expiredCount++;
            expiryValue += product.stock * product.sellingPrice;
          } else if (days <= maxThreshold) {
            nearExpiryCount++;
          }
        }
      });
      
      return {
        expiredCount,
        nearExpiryCount,
        totalWithExpiry: productsWithExpiry.length,
        expiryValue,
      };
    }
    const response = await apiClient.get<ExpiryStats>('/expiry/stats');
    return response.data;
  },

  // Update expiry date for a product
  updateExpiryDate: async (
    productId: number,
    expiryDate: string,
    batchNumber?: string,
    manufacturingDate?: string
  ): Promise<Product> => {
    if (isDemoMode) {
      // This would update the product in the mock data
      const product = await productApi.getById(productId);
      const updatedProduct = {
        ...product,
        expiryDate,
        batchNumber,
        manufacturingDate,
      };
      await productApi.update(productId, updatedProduct);
      return updatedProduct;
    }
    const response = await apiClient.put<Product>(`/expiry/${productId}`, {
      expiryDate,
      batchNumber,
      manufacturingDate,
    });
    return response.data;
  },

  // Get alert thresholds
  getAlertThresholds: async (): Promise<ExpiryAlertThreshold[]> => {
    if (isDemoMode) {
      return Promise.resolve([...alertThresholds]);
    }
    const response = await apiClient.get<ExpiryAlertThreshold[]>('/expiry/thresholds');
    return response.data;
  },

  // Update alert threshold
  updateAlertThreshold: async (threshold: ExpiryAlertThreshold): Promise<ExpiryAlertThreshold> => {
    if (isDemoMode) {
      const index = alertThresholds.findIndex(t => t.id === threshold.id);
      if (index !== -1) {
        alertThresholds[index] = threshold;
      }
      return Promise.resolve(threshold);
    }
    const response = await apiClient.put<ExpiryAlertThreshold>(
      `/expiry/thresholds/${threshold.id}`,
      threshold
    );
    return response.data;
  },

  // Bulk update expiry dates
  bulkUpdateExpiry: async (updates: Array<{
    productId: number;
    expiryDate: string;
    batchNumber?: string;
    manufacturingDate?: string;
  }>): Promise<void> => {
    if (isDemoMode) {
      for (const update of updates) {
        await expiryApi.updateExpiryDate(
          update.productId,
          update.expiryDate,
          update.batchNumber,
          update.manufacturingDate
        );
      }
      return Promise.resolve();
    }
    await apiClient.post('/expiry/bulk-update', { updates });
  },

  // Remove expiry date from product
  removeExpiryDate: async (productId: number): Promise<void> => {
    if (isDemoMode) {
      const product = await productApi.getById(productId);
      await productApi.update(productId, {
        ...product,
        expiryDate: undefined,
        batchNumber: undefined,
        manufacturingDate: undefined,
      });
      return Promise.resolve();
    }
    await apiClient.delete(`/expiry/${productId}`);
  },
};
