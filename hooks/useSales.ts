import { useState, useEffect, useCallback } from 'react';
import { salesApi } from '@/lib/api/sales';
import { SaleTransaction, SaleCommand, SalesStats } from '@/types';

/**
 * Custom hook for sales management
 * Follows Single Responsibility Principle - handles only sales data and operations
 * Separates business logic from UI components
 */
export function useSales() {
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await salesApi.getAllSales();
      setSales(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSale = useCallback(async (command: SaleCommand): Promise<SaleTransaction> => {
    try {
      setLoading(true);
      setError(null);
      const sale = await salesApi.createSale(command);
      setSales(prev => [sale, ...prev]);
      return sale;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSaleById = useCallback(async (id: number): Promise<SaleTransaction | undefined> => {
    try {
      setLoading(true);
      setError(null);
      const sale = await salesApi.getSaleById(id);
      return sale;
    } catch (err) {
      setError(err as Error);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    loading,
    error,
    fetchSales,
    createSale,
    getSaleById,
  };
}

/**
 * Custom hook for sales statistics
 * Follows Single Responsibility Principle
 */
export function useSalesStats() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await salesApi.getSalesStats();
      setStats(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

