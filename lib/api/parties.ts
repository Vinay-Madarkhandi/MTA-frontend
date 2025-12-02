import { apiClient } from '../api-client';
import { ApiResponse, Party, PartyCommand } from '@/types';

/**
 * Party API - Handles all party-related API calls (Tally-style customers/suppliers)
 * Follows Single Responsibility Principle
 */
export const partyApi = {
  // Get all parties
  getAllParties: async (): Promise<Party[]> => {
    const response = await apiClient.get<ApiResponse<Party[]>>('/parties');
    return response.data.data;
  },

  // Get party by ID
  getPartyById: async (id: number): Promise<Party> => {
    const response = await apiClient.get<ApiResponse<Party>>(`/parties/${id}`);
    return response.data.data;
  },

  // Get parties by type
  getPartiesByType: async (type: 'CUSTOMER' | 'SUPPLIER'): Promise<Party[]> => {
    const response = await apiClient.get<ApiResponse<Party[]>>(`/parties/type/${type}`);
    return response.data.data;
  },

  // Create new party
  createParty: async (command: PartyCommand): Promise<Party> => {
    const response = await apiClient.post<ApiResponse<Party>>('/parties', command);
    return response.data.data;
  },

  // Update party
  updateParty: async (id: number, command: PartyCommand): Promise<Party> => {
    const response = await apiClient.put<ApiResponse<Party>>(`/parties/${id}`, command);
    return response.data.data;
  },

  // Delete party
  deleteParty: async (id: number): Promise<void> => {
    await apiClient.delete(`/parties/${id}`);
  },

  // Update party balance
  updatePartyBalance: async (id: number, amount: number, type: 'ADD' | 'DEDUCT'): Promise<Party> => {
    const response = await apiClient.post<ApiResponse<Party>>(`/parties/${id}/balance`, { amount, type });
    return response.data.data;
  },

  // Get party ledger
  getPartyLedger: async (id: number): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/parties/${id}/ledger`);
    return response.data.data;
  },
};
