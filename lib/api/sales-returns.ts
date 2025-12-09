import { apiClient } from '../api-client';
import { ApiResponse } from '@/types';

/**
 * Sales Return API Client
 * Handles all sales return-related API calls
 */

export interface SalesReturn {
  id: number;
  returnNumber: string;
  originalSaleId: number;
  originalVoucherNo: string;
  customerId: number;
  customerName: string;
  customerPhone?: string;
  returnDate: string;
  returnReason: 'DEFECTIVE' | 'WRONG_PRODUCT' | 'DAMAGED' | 'QUALITY_ISSUE' | 'CUSTOMER_DISSATISFACTION' | 'EXPIRED' | 'OTHER';
  stockAction: 'RESALABLE' | 'DAMAGED' | 'EXPIRED';
  refundMode: 'CASH' | 'UPI' | 'BANK' | 'WALLET' | 'CARD' | 'AEPS' | 'CREDIT_NOTE';
  refundAmount: number;
  
  // Financial amounts
  subtotal: number;
  totalTax: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  
  // AEPS details
  aepsTransactionId?: string;
  aepsBankName?: string;
  aepsBankRrn?: string;
  aepsAadhaarMasked?: string;
  aepsStatus?: 'SUCCESS' | 'FAILURE' | 'PENDING';
  aepsResponseCode?: string;
  aepsResponseMessage?: string;
  
  // Bank/Payment details
  bankName?: string;
  transactionId?: string;
  upiReference?: string;
  cardLast4?: string;
  
  // Refund processing
  refundProcessed: boolean;
  refundProcessedDate?: string;
  refundProcessedBy?: string;
  
  // Credit note
  creditNoteNumber?: string;
  creditNoteAmount?: number;
  creditNoteUsed: boolean;
  creditNoteExpiryDate?: string;
  
  // Status & approval
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'REFUND_PROCESSED';
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  
  // Security & audit
  otpVerified: boolean;
  otpVerificationTime?: string;
  deviceInfo?: string;
  ipAddress?: string;
  
  notes?: string;
  items: SalesReturnItem[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesReturnItem {
  id?: number;
  returnId?: number;
  saleItemId: number;
  productId: number;
  productName: string;
  sku?: string;
  originalQuantity: number;
  returnQuantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  stockAdjusted?: boolean;
  stockAdjustmentDate?: string;
  damageRecorded?: boolean;
}

export interface SalesReturnCommand {
  originalSaleId: number;
  originalVoucherNo?: string;
  customerId: number;
  customerName: string;
  customerPhone?: string;
  returnDate: string;
  returnReason: 'DEFECTIVE' | 'WRONG_PRODUCT' | 'DAMAGED' | 'QUALITY_ISSUE' | 'CUSTOMER_DISSATISFACTION' | 'EXPIRED' | 'OTHER';
  stockAction: 'RESALABLE' | 'DAMAGED' | 'EXPIRED';
  refundMode: 'CASH' | 'UPI' | 'BANK' | 'WALLET' | 'CARD' | 'AEPS' | 'CREDIT_NOTE';
  refundAmount: number;
  subtotal: number;
  totalTax: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  aepsTransactionId?: string;
  aepsBankName?: string;
  aepsBankRrn?: string;
  aepsAadhaarMasked?: string;
  aepsStatus?: 'SUCCESS' | 'FAILURE' | 'PENDING';
  aepsResponseCode?: string;
  aepsResponseMessage?: string;
  bankName?: string;
  transactionId?: string;
  upiReference?: string;
  cardLast4?: string;
  creditNoteAmount?: number;
  creditNoteExpiryDate?: string;
  otpVerified?: boolean;
  deviceInfo?: string;
  ipAddress?: string;
  notes?: string;
  items: SalesReturnItemCommand[];
}

export interface SalesReturnItemCommand {
  saleItemId: number;
  productId: number;
  productName: string;
  sku?: string;
  originalQuantity: number;
  returnQuantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export interface SalesReturnStats {
  totalReturns: number;
  todayReturns: number;
  monthReturns: number;
  pendingApprovals: number;
  approvedReturns: number;
  rejectedReturns: number;
  totalReturnAmount: number;
  todayReturnAmount: number;
  monthReturnAmount: number;
  totalRefundsProcessed: number;
  pendingRefunds: number;
  totalRefundAmount: number;
  cashRefunds: number;
  upiRefunds: number;
  bankRefunds: number;
  walletRefunds: number;
  cardRefunds: number;
  aepsRefunds: number;
  creditNotes: number;
  resalableItems: number;
  damagedItems: number;
  expiredItems: number;
  defectiveReturns: number;
  wrongProductReturns: number;
  damagedReturns: number;
  qualityIssueReturns: number;
  dissatisfactionReturns: number;
  expiredReturns: number;
  otherReturns: number;
}

const salesReturnApi = {
  /**
   * Create new sales return
   */
  async createSalesReturn(command: SalesReturnCommand): Promise<SalesReturn> {
    const response = await apiClient.post<ApiResponse<SalesReturn>>('/sales-returns', command);
    return response.data.data;
  },

  /**
   * Get all sales returns
   */
  async getAllSalesReturns(): Promise<SalesReturn[]> {
    const response = await apiClient.get<ApiResponse<SalesReturn[]>>('/sales-returns');
    return response.data.data;
  },

  /**
   * Get sales return by ID
   */
  async getSalesReturnById(id: number): Promise<SalesReturn> {
    const response = await apiClient.get<ApiResponse<SalesReturn>>(`/sales-returns/${id}`);
    return response.data.data;
  },

  /**
   * Get sales returns for a specific sale
   */
  async getSalesReturnsBySaleId(saleId: number): Promise<SalesReturn[]> {
    const response = await apiClient.get<ApiResponse<SalesReturn[]>>(
      `/sales-returns/sale/${saleId}`
    );
    return response.data.data;
  },

  /**
   * Generate next return number
   */
  async getNextReturnNumber(): Promise<string> {
    const response = await apiClient.get<ApiResponse<string>>('/sales-returns/next-number');
    return response.data.data;
  },

  /**
   * Approve sales return
   */
  async approveSalesReturn(id: number): Promise<SalesReturn> {
    const response = await apiClient.put<ApiResponse<SalesReturn>>(
      `/sales-returns/${id}/approve`
    );
    return response.data.data;
  },

  /**
   * Reject sales return
   */
  async rejectSalesReturn(id: number, reason: string): Promise<SalesReturn> {
    const response = await apiClient.put<ApiResponse<SalesReturn>>(
      `/sales-returns/${id}/reject`,
      { reason }
    );
    return response.data.data;
  },

  /**
   * Get sales return statistics
   */
  async getStats(): Promise<SalesReturnStats> {
    const response = await apiClient.get<ApiResponse<SalesReturnStats>>('/sales-returns/stats');
    return response.data.data;
  },
};

export default salesReturnApi;
