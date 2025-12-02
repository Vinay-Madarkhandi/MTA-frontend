import { apiClient } from '../api-client';
import { ApiResponse } from '@/types';

/**
 * Purchase API - Handles all purchase-related API calls (Purchase Voucher)
 * Follows Single Responsibility Principle
 */

export interface PurchaseTransaction {
  id: number;
  purchaseNumber: string;
  supplierId?: number;
  supplierName: string;
  supplierContact?: string;
  supplierEmail?: string;
  supplierGst?: string;
  supplierAddress?: string;
  purchaseDate: string;
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  shippingCharges: number;
  otherCharges: number;
  grandTotal: number;
  paymentStatus: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  items: PurchaseItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

export interface PurchaseCommand {
  purchaseNumber?: string;
  supplierId?: number;
  supplierName: string;
  supplierContact?: string;
  supplierEmail?: string;
  supplierGst?: string;
  supplierAddress?: string;
  purchaseDate: string;
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  shippingCharges: number;
  otherCharges: number;
  grandTotal: number;
  paymentStatus: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    discountPercent: number;
    discountAmount: number;
    total: number;
  }[];
}

export const purchaseApi = {
  // Get all purchases
  getAllPurchases: async (): Promise<PurchaseTransaction[]> => {
    const response = await apiClient.get<ApiResponse<PurchaseTransaction[]>>('/purchases');
    return response.data.data;
  },

  // Get purchase by ID
  getPurchaseById: async (id: number): Promise<PurchaseTransaction> => {
    const response = await apiClient.get<ApiResponse<PurchaseTransaction>>(`/purchases/${id}`);
    return response.data.data;
  },

  // Get purchase by number
  getPurchaseByNumber: async (purchaseNumber: string): Promise<PurchaseTransaction> => {
    const response = await apiClient.get<ApiResponse<PurchaseTransaction>>(`/purchases/number/${purchaseNumber}`);
    return response.data.data;
  },

  // Generate next purchase number
  getNextPurchaseNumber: async (): Promise<string> => {
    const response = await apiClient.get<ApiResponse<string>>('/purchases/next-number');
    return response.data.data;
  },

  // Create new purchase
  createPurchase: async (command: PurchaseCommand): Promise<PurchaseTransaction> => {
    const response = await apiClient.post<ApiResponse<PurchaseTransaction>>('/purchases', command);
    return response.data.data;
  },

  // Get purchases by date range
  getPurchasesByDateRange: async (startDate: string, endDate: string): Promise<PurchaseTransaction[]> => {
    const response = await apiClient.get<ApiResponse<PurchaseTransaction[]>>(
      `/purchases/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data.data;
  },

  // Get purchases by supplier
  getPurchasesBySupplier: async (supplierId: number): Promise<PurchaseTransaction[]> => {
    const response = await apiClient.get<ApiResponse<PurchaseTransaction[]>>(`/purchases/supplier/${supplierId}`);
    return response.data.data;
  },
};
