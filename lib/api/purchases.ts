import { apiClient } from '../api-client';
import { Purchase, PurchaseCommand, PurchaseStats, PaymentRequest, PaymentResponse } from '@/types';

export const purchaseApi = {
  // Get all purchases with optional filters
  getAll: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    supplierId?: string;
  }): Promise<Purchase[]> => {
    const response = await apiClient.get<Purchase[]>('/purchases', { params });
    return response.data;
  },

  // Get a single purchase by ID
  getById: async (id: string): Promise<Purchase> => {
    const response = await apiClient.get<Purchase>(`/purchases/${id}`);
    return response.data;
  },

  // Get purchase by purchase number
  getByPurchaseNumber: async (purchaseNumber: string): Promise<Purchase> => {
    const response = await apiClient.get<Purchase>(`/purchases/number/${purchaseNumber}`);
    return response.data;
  },

  // Create a new purchase
  create: async (data: PurchaseCommand): Promise<Purchase> => {
    const response = await apiClient.post<Purchase>('/purchases', data);
    return response.data;
  },

  // Update an existing purchase
  update: async (id: string, data: Partial<PurchaseCommand>): Promise<Purchase> => {
    const response = await apiClient.put<Purchase>(`/purchases/${id}`, data);
    return response.data;
  },

  // Delete a purchase
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/purchases/${id}`);
  },

  // Get purchase statistics
  getStats: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<PurchaseStats> => {
    const response = await apiClient.get<PurchaseStats>('/purchases/stats', { params });
    return response.data;
  },

  // Process payment for a purchase
  processPayment: async (data: PaymentRequest): Promise<PaymentResponse> => {
    const response = await apiClient.post<PaymentResponse>('/purchases/payment', data);
    return response.data;
  },

  // Initiate POS payment (will redirect to POS machine or payment gateway)
  initiatePOSPayment: async (purchaseId: string, amount: number): Promise<{
    paymentUrl: string;
    sessionId: string;
  }> => {
    const response = await apiClient.post<{
      paymentUrl: string;
      sessionId: string;
    }>('/purchases/payment/pos/initiate', { purchaseId, amount });
    return response.data;
  },

  // Verify POS payment status
  verifyPOSPayment: async (sessionId: string): Promise<PaymentResponse> => {
    const response = await apiClient.get<PaymentResponse>(`/purchases/payment/pos/verify/${sessionId}`);
    return response.data;
  },

  // Update payment status (webhook callback from payment gateway)
  updatePaymentStatus: async (purchaseId: string, status: {
    paymentStatus: "pending" | "partial" | "paid";
    transactionId: string;
    paymentMethod: string;
  }): Promise<Purchase> => {
    const response = await apiClient.patch<Purchase>(`/purchases/${purchaseId}/payment-status`, status);
    return response.data;
  },

  // Get purchases by supplier
  getBySupplier: async (supplierId: string): Promise<Purchase[]> => {
    const response = await apiClient.get<Purchase[]>(`/purchases/supplier/${supplierId}`);
    return response.data;
  },

  // Get pending purchases
  getPending: async (): Promise<Purchase[]> => {
    const response = await apiClient.get<Purchase[]>('/purchases/pending');
    return response.data;
  },

  // Export purchase as PDF
  exportPDF: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/purchases/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  // Export purchase as Excel
  exportExcel: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> => {
    const response = await apiClient.get('/purchases/export/excel', {
      params,
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
