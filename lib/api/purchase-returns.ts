import { apiClient } from '../api-client';
import { ApiResponse } from '@/types';

/**
 * Purchase Return API Client
 * Handles all purchase return-related API calls
 */

export interface PurchaseReturn {
  id: number;
  returnNumber: string;
  originalPurchaseId: number;
  originalPurchaseNumber: string;
  supplierId?: number;
  supplierName: string;
  returnDate: string;
  returnReason: 'DAMAGED' | 'WRONG_ITEM' | 'EXCESS' | 'EXPIRED' | 'QUALITY_ISSUE' | 'OTHER';
  adjustmentType: 'ADJUST_IN_NEXT' | 'CASH_REFUND' | 'BANK_REFUND' | 'WALLET' | 'AEPS' | 'NO_ADJUSTMENT';
  
  // Financial amounts
  subtotal: number;
  totalTax: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  
  // Refund details
  refundMethod?: 'CASH' | 'BANK' | 'UPI' | 'WALLET' | 'AEPS';
  refundAmount?: number;
  bankName?: string;
  transactionId?: string;
  refundReferenceNo?: string;
  refundProcessed: boolean;
  refundProcessedDate?: string;
  
  // Approval workflow
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  
  notes?: string;
  items: PurchaseReturnItem[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseReturnItem {
  id?: number;
  returnId?: number;
  purchaseItemId: number;
  productId: number;
  productName: string;
  originalQuantity: number;
  returnQuantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  stockAdjusted?: boolean;
  stockAdjustmentDate?: string;
}

export interface PurchaseReturnCommand {
  originalPurchaseId: number;
  originalPurchaseNumber?: string;
  supplierId?: number;
  supplierName: string;
  returnDate: string;
  returnReason: 'DAMAGED' | 'WRONG_ITEM' | 'EXCESS' | 'EXPIRED' | 'QUALITY_ISSUE' | 'OTHER';
  adjustmentType: 'ADJUST_IN_NEXT' | 'CASH_REFUND' | 'BANK_REFUND' | 'WALLET' | 'AEPS' | 'NO_ADJUSTMENT';
  subtotal: number;
  totalTax: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  refundMethod?: 'CASH' | 'BANK' | 'UPI' | 'WALLET' | 'AEPS';
  refundAmount?: number;
  bankName?: string;
  transactionId?: string;
  refundReferenceNo?: string;
  notes?: string;
  items: PurchaseReturnItemCommand[];
}

export interface PurchaseReturnItemCommand {
  purchaseItemId: number;
  productId: number;
  productName: string;
  originalQuantity: number;
  returnQuantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export interface PurchaseReturnStats {
  totalReturns: number;
  todayReturns: number;
  monthReturns: number;
  totalReturnTransactions: number;
  pendingApprovals: number;
  approvedReturns: number;
  rejectedReturns: number;
  totalRefundsProcessed: number;
  pendingRefunds: number;
}

const purchaseReturnApi = {
  /**
   * Create new purchase return
   */
  async createPurchaseReturn(command: PurchaseReturnCommand): Promise<PurchaseReturn> {
    const response = await apiClient.post<ApiResponse<PurchaseReturn>>('/purchase-returns', command);
    return response.data.data;
  },

  /**
   * Get all purchase returns
   */
  async getAllPurchaseReturns(): Promise<PurchaseReturn[]> {
    const response = await apiClient.get<ApiResponse<PurchaseReturn[]>>('/purchase-returns');
    return response.data.data;
  },

  /**
   * Get purchase return by ID
   */
  async getPurchaseReturnById(id: number): Promise<PurchaseReturn> {
    const response = await apiClient.get<ApiResponse<PurchaseReturn>>(`/purchase-returns/${id}`);
    return response.data.data;
  },

  /**
   * Get purchase returns for a specific purchase
   */
  async getPurchaseReturnsByPurchaseId(purchaseId: number): Promise<PurchaseReturn[]> {
    const response = await apiClient.get<ApiResponse<PurchaseReturn[]>>(
      `/purchase-returns/purchase/${purchaseId}`
    );
    return response.data.data;
  },

  /**
   * Generate next return number
   */
  async getNextReturnNumber(): Promise<string> {
    const response = await apiClient.get<ApiResponse<string>>('/purchase-returns/next-number');
    return response.data.data;
  },

  /**
   * Approve purchase return
   */
  async approvePurchaseReturn(id: number): Promise<PurchaseReturn> {
    const response = await apiClient.put<ApiResponse<PurchaseReturn>>(
      `/purchase-returns/${id}/approve`
    );
    return response.data.data;
  },

  /**
   * Reject purchase return
   */
  async rejectPurchaseReturn(id: number, reason: string): Promise<PurchaseReturn> {
    const response = await apiClient.put<ApiResponse<PurchaseReturn>>(
      `/purchase-returns/${id}/reject`,
      { reason }
    );
    return response.data.data;
  },

  /**
   * Get purchase return statistics
   */
  async getStats(): Promise<PurchaseReturnStats> {
    const response = await apiClient.get<ApiResponse<PurchaseReturnStats>>('/purchase-returns/stats');
    return response.data.data;
  },
};

export default purchaseReturnApi;
