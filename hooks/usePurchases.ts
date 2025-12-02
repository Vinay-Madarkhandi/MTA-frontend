import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

/**
 * Custom hook for purchase orders management
 * Follows Single Responsibility Principle
 */

export interface PurchaseItem {
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

export interface Purchase {
  id: number;
  purchaseNumber: string;
  supplierName: string;
  supplierContact: string;
  supplierEmail?: string;
  supplierGST?: string;
  supplierAddress?: string;
  purchaseDate: string;
  items: PurchaseItem[];
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  shippingCharges: number;
  otherCharges: number;
  grandTotal: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod: 'cash' | 'card' | 'upi' | 'netbanking' | 'pos';
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseCommand {
  supplierName: string;
  supplierContact: string;
  supplierEmail?: string;
  supplierGST?: string;
  supplierAddress?: string;
  purchaseDate: string;
  items: PurchaseItem[];
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  shippingCharges: number;
  otherCharges: number;
  grandTotal: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod: 'cash' | 'card' | 'upi' | 'netbanking' | 'pos';
  transactionId?: string;
  notes?: string;
}

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Purchase[]>('/purchases');
      setPurchases(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPurchase = useCallback(async (command: PurchaseCommand): Promise<Purchase> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post<Purchase>('/purchases', command);
      const purchase = response.data;
      setPurchases(prev => [purchase, ...prev]);
      return purchase;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPurchaseById = useCallback(async (id: number): Promise<Purchase | undefined> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Purchase>(`/purchases/${id}`);
      return response.data;
    } catch (err) {
      setError(err as Error);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    purchases,
    loading,
    error,
    fetchPurchases,
    createPurchase,
    getPurchaseById,
  };
}

