import { apiClient } from '../api-client';
import { 
  ApiResponse,
  SaleTransaction, 
  SaleCommand, 
  SalesStats, 
  PartySalesSummary, 
  ItemSalesSummary 
} from '@/types';

/**
 * Sales API - Handles all sales transaction API calls (Tally-style sales)
 * Follows Single Responsibility Principle
 */
export const salesApi = {
  // Get all sales transactions
  getAllSales: async (): Promise<SaleTransaction[]> => {
    const response = await apiClient.get<ApiResponse<SaleTransaction[]>>('/sales');
    return response.data.data;
  },

  // Get sale by ID
  getSaleById: async (id: number): Promise<SaleTransaction> => {
    const response = await apiClient.get<ApiResponse<SaleTransaction>>(`/sales/${id}`);
    return response.data.data;
  },

  // Get sale by voucher number
  getSaleByVoucher: async (voucherNo: string): Promise<SaleTransaction> => {
    const response = await apiClient.get<ApiResponse<SaleTransaction>>(`/sales/voucher/${voucherNo}`);
    return response.data.data;
  },

  // Create new sale
  createSale: async (command: SaleCommand): Promise<SaleTransaction> => {
    const response = await apiClient.post<ApiResponse<SaleTransaction>>('/sales', command);
    return response.data.data;
  },

  // Update sale
  updateSale: async (id: number, command: SaleCommand): Promise<SaleTransaction> => {
    const response = await apiClient.put<ApiResponse<SaleTransaction>>(`/sales/${id}`, command);
    return response.data.data;
  },

  // Delete sale
  deleteSale: async (id: number): Promise<void> => {
    await apiClient.delete(`/sales/${id}`);
  },

  // Get sales statistics
  getSalesStats: async (): Promise<SalesStats> => {
    const response = await apiClient.get<ApiResponse<SalesStats>>('/sales/stats');
    return response.data.data;
  },

  // Get party-wise sales summary
  getPartySalesSummary: async (startDate?: string, endDate?: string): Promise<PartySalesSummary[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get<ApiResponse<PartySalesSummary[]>>(`/sales/reports/party-wise?${params.toString()}`);
    return response.data.data;
  },

  // Get item-wise sales summary
  getItemSalesSummary: async (startDate?: string, endDate?: string): Promise<ItemSalesSummary[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get<ApiResponse<ItemSalesSummary[]>>(`/sales/reports/item-wise?${params.toString()}`);
    return response.data.data;
  },

  // Get date-wise sales
  getDateWiseSales: async (startDate: string, endDate: string): Promise<SaleTransaction[]> => {
    const response = await apiClient.get<ApiResponse<SaleTransaction[]>>(`/sales/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data;
  },

  // Get sales by party
  getSalesByParty: async (partyId: number): Promise<SaleTransaction[]> => {
    const response = await apiClient.get<ApiResponse<SaleTransaction[]>>(`/sales/party/${partyId}`);
    return response.data.data;
  },

  // Generate next voucher number
  getNextVoucherNo: async (): Promise<string> => {
    const response = await apiClient.get<ApiResponse<string>>('/sales/next-voucher');
    return response.data.data;
  },

  // Update payment status
  updatePaymentStatus: async (
    id: number, 
    status: 'PAID' | 'UNPAID' | 'PARTIAL', 
    paidAmount: number
  ): Promise<SaleTransaction> => {
    const response = await apiClient.patch<ApiResponse<SaleTransaction>>(`/sales/${id}/payment`, { status, paidAmount });
    return response.data.data;
  },
};
