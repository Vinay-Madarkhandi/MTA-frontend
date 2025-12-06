import { apiClient } from '../api-client';
import { ApiResponse } from '@/types';

/**
 * Receipt Entry API
 * Handles customer receipt entries with accounting
 */

export interface ReceiptEntry {
    id: number;
    receiptNumber: string;
    receiptDate: string;
    receiptType: 'AGAINST_INVOICE' | 'OUTSTANDING_RECOVERY' | 'ADVANCE' | 'OTHER_INCOME';
    partyId?: number;
    partyName: string;
    paymentMethod: string;
    amountReceived: number;
    bankName?: string;
    chequeNumber?: string;
    chequeDate?: string;
    transactionId?: string;
    incomeHead?: string;
    narration?: string;
    companyId: number;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
    adjustments?: ReceiptInvoiceAdjustment[];
}

export interface ReceiptInvoiceAdjustment {
    id: number;
    receiptEntryId: number;
    saleId: number;
    invoiceNumber: string;
    invoiceAmount: number;
    adjustedAmount: number;
    balanceAfterAdjustment: number;
    createdAt: string;
}

export interface OutstandingInvoice {
    saleId: number;
    invoiceNumber: string;
    invoiceDate: string;
    invoiceAmount: number;
    paidAmount: number;
    balanceAmount: number;
}

export interface InvoiceAdjustmentCommand {
    saleId: number;
    invoiceNumber: string;
    invoiceAmount: number;
    adjustedAmount: number;
}

export interface ReceiptEntryCommand {
    receiptDate: string;
    receiptType: 'AGAINST_INVOICE' | 'OUTSTANDING_RECOVERY' | 'ADVANCE' | 'OTHER_INCOME';
    partyId?: number;
    partyName: string;
    paymentMethod: string;
    amountReceived: number;
    bankName?: string;
    chequeNumber?: string;
    chequeDate?: string;
    transactionId?: string;
    incomeHead?: string;
    narration?: string;
    invoiceAdjustments?: InvoiceAdjustmentCommand[];
}

/**
 * Create new receipt entry
 */
export const createReceiptEntry = async (command: ReceiptEntryCommand): Promise<ReceiptEntry> => {
    const response = await apiClient.post<ApiResponse<ReceiptEntry>>('/receipts', command);
    return response.data.data;
};

/**
 * Get all receipts
 */
export const getAllReceipts = async (): Promise<ReceiptEntry[]> => {
    const response = await apiClient.get<ApiResponse<ReceiptEntry[]>>('/receipts');
    return response.data.data;
};

/**
 * Get receipt by ID
 */
export const getReceiptById = async (id: number): Promise<ReceiptEntry> => {
    const response = await apiClient.get<ApiResponse<ReceiptEntry>>(`/receipts/${id}`);
    return response.data.data;
};

/**
 * Get receipts by party
 */
export const getReceiptsByParty = async (partyId: number): Promise<ReceiptEntry[]> => {
    const response = await apiClient.get<ApiResponse<ReceiptEntry[]>>(`/receipts/party/${partyId}`);
    return response.data.data;
};

/**
 * Get outstanding invoices for a party
 */
export const getOutstandingInvoices = async (partyId: number): Promise<OutstandingInvoice[]> => {
    const response = await apiClient.get<ApiResponse<OutstandingInvoice[]>>(`/receipts/outstanding/${partyId}`);
    return response.data.data || []; // Ensure always returns an array
};

const receiptApi = {
    createReceiptEntry,
    getAllReceipts,
    getReceiptById,
    getReceiptsByParty,
    getOutstandingInvoices,
};

export default receiptApi;
