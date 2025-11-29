import { apiClient } from '../api-client';
import { 
  SaleTransaction, 
  SaleCommand, 
  SalesStats, 
  PartySalesSummary, 
  ItemSalesSummary 
} from '@/types';
import { mockApi } from '../mockData';

const USE_MOCK = true; // Set to false when backend is ready

export const salesApi = {
  // Get all sales transactions
  getAllSales: async (): Promise<SaleTransaction[]> => {
    if (USE_MOCK) return mockApi.getSalesTransactions();
    const response = await apiClient.get<SaleTransaction[]>('/sales');
    return response.data;
  },

  // Get sale by ID
  getSaleById: async (id: number): Promise<SaleTransaction> => {
    const response = await apiClient.get<SaleTransaction>(`/sales/${id}`);
    return response.data;
  },

  // Get sale by voucher number
  getSaleByVoucher: async (voucherNo: string): Promise<SaleTransaction> => {
    const response = await apiClient.get<SaleTransaction>(`/sales/voucher/${voucherNo}`);
    return response.data;
  },

  // Create new sale
  createSale: async (command: SaleCommand): Promise<SaleTransaction> => {
    if (USE_MOCK) return mockApi.createSale(command);
    const response = await apiClient.post<SaleTransaction>('/sales', command);
    return response.data;
  },

  // Update sale
  updateSale: async (id: number, command: SaleCommand): Promise<SaleTransaction> => {
    const response = await apiClient.put<SaleTransaction>(`/sales/${id}`, command);
    return response.data;
  },

  // Delete sale
  deleteSale: async (id: number): Promise<void> => {
    await apiClient.delete(`/sales/${id}`);
  },

  // Get sales statistics
  getSalesStats: async (): Promise<SalesStats> => {
    if (USE_MOCK) return mockApi.getSalesStats();
    const response = await apiClient.get<SalesStats>('/sales/stats');
    return response.data;
  },

  // Get party-wise sales summary
  getPartySalesSummary: async (startDate?: string, endDate?: string): Promise<PartySalesSummary[]> => {
    if (USE_MOCK) return await mockApi.getPartySalesSummary() as any;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get<PartySalesSummary[]>(`/sales/reports/party-wise?${params.toString()}`);
    return response.data;
  },

  // Get item-wise sales summary
  getItemSalesSummary: async (startDate?: string, endDate?: string): Promise<ItemSalesSummary[]> => {
    if (USE_MOCK) return await mockApi.getItemSalesSummary() as any;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get<ItemSalesSummary[]>(`/sales/reports/item-wise?${params.toString()}`);
    return response.data;
  },

  // Get date-wise sales
  getDateWiseSales: async (startDate: string, endDate: string): Promise<SaleTransaction[]> => {
    const response = await apiClient.get<SaleTransaction[]>(`/sales?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Get sales by party
  getSalesByParty: async (partyId: number): Promise<SaleTransaction[]> => {
    const response = await apiClient.get<SaleTransaction[]>(`/sales/party/${partyId}`);
    return response.data;
  },

  // Generate next voucher number
  getNextVoucherNo: async (): Promise<string> => {
    if (USE_MOCK) return mockApi.getNextVoucherNo();
    const response = await apiClient.get<{ voucherNo: string }>('/sales/next-voucher');
    return response.data.voucherNo;
  },

  // Update payment status
  updatePaymentStatus: async (
    id: number, 
    status: 'PAID' | 'UNPAID' | 'PARTIAL', 
    paidAmount: number
  ): Promise<SaleTransaction> => {
    const response = await apiClient.post<SaleTransaction>(`/sales/${id}/payment`, { status, paidAmount });
    return response.data;
  },
};
