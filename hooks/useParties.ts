import { useState, useEffect, useCallback } from 'react';
import { partyApi } from '@/lib/api/parties';
import { Party, PartyCommand } from '@/types';

/**
 * Custom hook for party management (Tally-style customers/suppliers)
 * Follows Single Responsibility Principle - handles only party data and operations
 */
export function useParties(type?: 'CUSTOMER' | 'SUPPLIER') {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchParties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = type 
        ? await partyApi.getPartiesByType(type)
        : await partyApi.getAllParties();
      setParties(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const createParty = useCallback(async (command: PartyCommand): Promise<Party> => {
    try {
      setLoading(true);
      setError(null);
      const party = await partyApi.createParty(command);
      setParties(prev => [...prev, party]);
      return party;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateParty = useCallback(async (id: number, command: PartyCommand): Promise<Party> => {
    try {
      setLoading(true);
      setError(null);
      const party = await partyApi.updateParty(id, command);
      setParties(prev => prev.map(p => p.id === id ? party : p));
      return party;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteParty = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await partyApi.deleteParty(id);
      setParties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  return {
    parties,
    loading,
    error,
    fetchParties,
    createParty,
    updateParty,
    deleteParty,
  };
}

/**
 * Custom hook for getting customers specifically
 */
export function useCustomers() {
  return useParties('CUSTOMER');
}

/**
 * Custom hook for getting suppliers specifically
 */
export function useSuppliers() {
  return useParties('SUPPLIER');
}

