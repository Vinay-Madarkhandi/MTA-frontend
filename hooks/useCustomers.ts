import { useState, useEffect, useCallback } from 'react';
import { customerApi } from '@/lib/api/customers';
import { Customer, CustomerCommand, CustomerStats } from '@/types';

/**
 * Custom hook for customer management (CRM)
 * Follows Single Responsibility Principle - handles only customer data and operations
 */
export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = useCallback(async (command: CustomerCommand): Promise<Customer> => {
    try {
      setLoading(true);
      setError(null);
      const customer = await customerApi.create(command);
      setCustomers(prev => [...prev, customer]);
      return customer;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCustomer = useCallback(async (id: number, command: CustomerCommand): Promise<Customer> => {
    try {
      setLoading(true);
      setError(null);
      const customer = await customerApi.update(id, command);
      setCustomers(prev => prev.map(c => c.id === id ? customer : c));
      return customer;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomer = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await customerApi.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}

/**
 * Custom hook for customer statistics
 */
export function useCustomerStats() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerApi.getStats();
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

