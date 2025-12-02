import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '@/lib/api/orders';
import { Order, OrderCommand, DashboardStats } from '@/types';

/**
 * Custom hook for order management
 * Follows Single Responsibility Principle - handles only order data and operations
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAll();
      setOrders(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentOrders = useCallback(async (limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getRecent(limit);
      setOrders(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (command: OrderCommand): Promise<Order> => {
    try {
      setLoading(true);
      setError(null);
      const order = await orderApi.create(command);
      setOrders(prev => [order, ...prev]);
      return order;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchRecentOrders,
    createOrder,
  };
}

/**
 * Custom hook for dashboard statistics
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getTodaysStats();
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

