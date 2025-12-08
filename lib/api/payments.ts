import { apiClient } from "../api-client";

export interface InvoiceAdjustmentCommand {
  purchaseId: number;
  invoiceNumber: string;
  invoiceAmount: number;
  adjustedAmount: number;
}

export interface PaymentEntryCommand {
  paymentDate: string;
  paymentType: "AGAINST_INVOICE" | "OUTSTANDING_SETTLEMENT" | "ADVANCE_PAYMENT" | "OTHER_EXPENSE";
  partyId?: number;
  partyName: string;
  paymentMethod: string;
  amountPaid: number;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  transactionId?: string;
  expenseHead?: string;
  narration?: string;
  invoiceAdjustments?: InvoiceAdjustmentCommand[];
}

export interface PaymentInvoiceAdjustment {
  id: number;
  paymentEntryId: number;
  purchaseId: number;
  invoiceNumber: string;
  invoiceAmount: number;
  adjustedAmount: number;
  balanceAfterAdjustment: number;
  createdAt: string;
}

export interface PaymentEntry {
  id: number;
  paymentNumber: string;
  paymentDate: string;
  paymentType: "AGAINST_INVOICE" | "OUTSTANDING_SETTLEMENT" | "ADVANCE_PAYMENT" | "OTHER_EXPENSE";
  partyId?: number;
  partyName?: string;
  paymentMethod: string;
  amountPaid: number;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  transactionId?: string;
  expenseHead?: string;
  narration?: string;
  companyId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  adjustments?: PaymentInvoiceAdjustment[];
}

export interface OutstandingPurchase {
  purchaseId: number;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceAmount: number;
  paidAmount: number;
  balanceAmount: number;
}

const paymentApi = {
  /**
   * Create a new payment entry
   */
  async createPayment(command: PaymentEntryCommand): Promise<PaymentEntry> {
    const response = await apiClient.post<PaymentEntry>("/payments", command);
    return response.data;
  },

  /**
   * Get all payment entries
   */
  async getAllPayments(): Promise<PaymentEntry[]> {
    const response = await apiClient.get<PaymentEntry[]>("/payments");
    return response.data;
  },

  /**
   * Get payment entry by ID
   */
  async getPaymentById(id: number): Promise<PaymentEntry> {
    const response = await apiClient.get<PaymentEntry>(`/payments/${id}`);
    return response.data;
  },

  /**
   * Get payments by supplier
   */
  async getPaymentsByParty(partyId: number): Promise<PaymentEntry[]> {
    const response = await apiClient.get<PaymentEntry[]>(`/payments/party/${partyId}`);
    return response.data;
  },

  /**
   * Get outstanding purchases for a supplier
   */
  async getOutstandingPurchases(partyId: number): Promise<OutstandingPurchase[]> {
    const response = await apiClient.get<OutstandingPurchase[]>(
      `/payments/outstanding/${partyId}`
    );
    return response.data;
  },
};

export default paymentApi;
