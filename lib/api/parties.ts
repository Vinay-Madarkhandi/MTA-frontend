import { apiClient } from '../api-client';
import { Party, PartyCommand } from '@/types';
import { mockApi } from '../mockData';

const USE_MOCK = true; // Set to false when backend is ready

export const partyApi = {
  // Get all parties
  getAllParties: async (): Promise<Party[]> => {
    if (USE_MOCK) return mockApi.getParties();
    const response = await apiClient.get<Party[]>('/parties');
    return response.data;
  },

  // Get party by ID
  getPartyById: async (id: number): Promise<Party> => {
    const response = await apiClient.get<Party>(`/parties/${id}`);
    return response.data;
  },

  // Get parties by type
  getPartiesByType: async (type: 'CUSTOMER' | 'SUPPLIER'): Promise<Party[]> => {
    if (USE_MOCK) return mockApi.getPartiesByType(type);
    const response = await apiClient.get<Party[]>(`/parties?type=${type}`);
    return response.data;
  },

  // Create new party
  createParty: async (command: PartyCommand): Promise<Party> => {
    if (USE_MOCK) return mockApi.createParty(command);
    const response = await apiClient.post<Party>('/parties', command);
    return response.data;
  },

  // Update party
  updateParty: async (id: number, command: PartyCommand): Promise<Party> => {
    const response = await apiClient.put<Party>(`/parties/${id}`, command);
    return response.data;
  },

  // Delete party
  deleteParty: async (id: number): Promise<void> => {
     apiClient.delete(`/parties/${id}`);
  },

  // Update party balance
  updatePartyBalance: async (id: number, amount: number, type: 'ADD' | 'DEDUCT'): Promise<Party> => {
    const response = await apiClient.post<Party>(`/parties/${id}/balance`, { amount, type });
    return response.data;
  },

  // Get party ledger
  getPartyLedger: async (id: number): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`/parties/${id}/ledger`);
    return response.data;
  },
};
