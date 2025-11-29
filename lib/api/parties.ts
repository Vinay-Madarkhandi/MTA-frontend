import { apiClient } from '../api-client';
import { Party, PartyCommand } from '@/types';
import { mockApi } from '../mockData';

const USE_MOCK = true; // Set to false when backend is ready

export const partyApi = {
  // Get all parties
  getAllParties: async (): Promise<Party[]> => {
    if (USE_MOCK) return mockApi.getParties();
    return apiClient.get<Party[]>('/parties');
  },

  // Get party by ID
  getPartyById: async (id: number): Promise<Party> => {
    return apiClient.get<Party>(`/parties/${id}`);
  },

  // Get parties by type
  getPartiesByType: async (type: 'CUSTOMER' | 'SUPPLIER'): Promise<Party[]> => {
    if (USE_MOCK) return mockApi.getPartiesByType(type);
    return apiClient.get<Party[]>(`/parties?type=${type}`);
  },

  // Create new party
  createParty: async (command: PartyCommand): Promise<Party> => {
    if (USE_MOCK) return mockApi.createParty(command);
    return apiClient.post<Party>('/parties', command);
  },

  // Update party
  updateParty: async (id: number, command: PartyCommand): Promise<Party> => {
    return apiClient.put<Party>(`/parties/${id}`, command);
  },

  // Delete party
  deleteParty: async (id: number): Promise<void> => {
    return apiClient.delete(`/parties/${id}`);
  },

  // Update party balance
  updatePartyBalance: async (id: number, amount: number, type: 'ADD' | 'DEDUCT'): Promise<Party> => {
    return apiClient.post<Party>(`/parties/${id}/balance`, { amount, type });
  },

  // Get party ledger
  getPartyLedger: async (id: number): Promise<any[]> => {
    return apiClient.get<any[]>(`/parties/${id}/ledger`);
  },
};
