import { useState, useEffect, useCallback } from 'react';
import { productApi } from '@/lib/api/products';
import { Product, ProductCommand, InventorySummary } from '@/types';

/**
 * Custom hook for product management
 * Follows Single Responsibility Principle - handles only product data and operations
 * Separates business logic from UI components
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (command: ProductCommand): Promise<Product> => {
    try {
      setLoading(true);
      setError(null);
      const product = await productApi.create(command);
      setProducts(prev => [...prev, product]);
      return product;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: number, command: ProductCommand): Promise<Product> => {
    try {
      setLoading(true);
      setError(null);
      const product = await productApi.update(id, command);
      setProducts(prev => prev.map(p => p.id === id ? product : p));
      return product;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await productApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

/**
 * Custom hook for inventory summary
 */
export function useInventorySummary() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.getSummary();
      setSummary(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
}

