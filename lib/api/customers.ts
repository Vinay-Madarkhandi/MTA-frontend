import { apiClient } from '../api-client';
import { Customer, CustomerCommand, CustomerStats } from '@/types';

// Check if demo mode is enabled
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Mock data for demo mode
const mockCustomers: Customer[] = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    address: '123 MG Road, Bangalore, Karnataka 560001',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-11-20T15:45:00Z',
    totalPurchases: 15,
    totalSpent: 45780.50,
    lastPurchaseDate: '2024-11-20T15:45:00Z'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    phone: '+91 87654 32109',
    email: 'priya.sharma@email.com',
    address: '456 Park Street, Mumbai, Maharashtra 400001',
    createdAt: '2024-02-20T09:15:00Z',
    updatedAt: '2024-11-18T11:20:00Z',
    totalPurchases: 22,
    totalSpent: 67890.75,
    lastPurchaseDate: '2024-11-18T11:20:00Z'
  },
  {
    id: 3,
    name: 'Amit Patel',
    phone: '+91 76543 21098',
    email: 'amit.patel@email.com',
    address: '789 Nehru Place, Delhi 110019',
    createdAt: '2024-03-10T14:20:00Z',
    updatedAt: '2024-11-15T16:30:00Z',
    totalPurchases: 8,
    totalSpent: 23450.00,
    lastPurchaseDate: '2024-11-15T16:30:00Z'
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    phone: '+91 65432 10987',
    email: 'sneha.reddy@email.com',
    address: '321 Banjara Hills, Hyderabad, Telangana 500034',
    createdAt: '2024-04-05T08:45:00Z',
    updatedAt: '2024-11-22T10:15:00Z',
    totalPurchases: 18,
    totalSpent: 54320.25,
    lastPurchaseDate: '2024-11-22T10:15:00Z'
  },
  {
    id: 5,
    name: 'Vikram Singh',
    phone: '+91 54321 09876',
    email: 'vikram.singh@email.com',
    address: '654 Anna Salai, Chennai, Tamil Nadu 600002',
    createdAt: '2024-05-12T12:00:00Z',
    updatedAt: '2024-11-10T14:40:00Z',
    totalPurchases: 12,
    totalSpent: 38765.80,
    lastPurchaseDate: '2024-11-10T14:40:00Z'
  },
  {
    id: 6,
    name: 'Anjali Mehta',
    phone: '+91 43210 98765',
    email: 'anjali.mehta@email.com',
    address: '987 CG Road, Ahmedabad, Gujarat 380009',
    createdAt: '2024-06-18T16:30:00Z',
    updatedAt: '2024-11-25T09:50:00Z',
    totalPurchases: 25,
    totalSpent: 78900.60,
    lastPurchaseDate: '2024-11-25T09:50:00Z'
  },
  {
    id: 7,
    name: 'Rahul Verma',
    phone: '+91 32109 87654',
    email: '',
    address: '147 Hazratganj, Lucknow, Uttar Pradesh 226001',
    createdAt: '2024-07-22T11:10:00Z',
    updatedAt: '2024-11-12T13:25:00Z',
    totalPurchases: 5,
    totalSpent: 15670.00,
    lastPurchaseDate: '2024-11-12T13:25:00Z'
  },
  {
    id: 8,
    name: 'Kavita Desai',
    phone: '+91 21098 76543',
    email: 'kavita.desai@email.com',
    address: '258 FC Road, Pune, Maharashtra 411004',
    createdAt: '2024-08-14T13:40:00Z',
    updatedAt: '2024-11-24T17:05:00Z',
    totalPurchases: 20,
    totalSpent: 61230.40,
    lastPurchaseDate: '2024-11-24T17:05:00Z'
  }
];

let nextCustomerId = 9;

export const customerApi = {
  // Get all customers
  getAll: async (): Promise<Customer[]> => {
    if (isDemoMode) {
      return Promise.resolve([...mockCustomers]);
    }
    const response = await apiClient.get<Customer[]>('/customers');
    return response.data;
  },

  // Get customer by ID
  getById: async (id: number): Promise<Customer> => {
    if (isDemoMode) {
      const customer = mockCustomers.find(c => c.id === id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      return Promise.resolve({ ...customer });
    }
    const response = await apiClient.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  // Search customers by name or phone
  search: async (query: string): Promise<Customer[]> => {
    if (isDemoMode) {
      const lowerQuery = query.toLowerCase();
      const filtered = mockCustomers.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) ||
        c.phone.includes(query) ||
        (c.email && c.email.toLowerCase().includes(lowerQuery))
      );
      return Promise.resolve([...filtered]);
    }
    const response = await apiClient.get<Customer[]>(`/customers/search?q=${query}`);
    return response.data;
  },

  // Create new customer
  create: async (customer: CustomerCommand): Promise<Customer> => {
    if (isDemoMode) {
      const newCustomer: Customer = {
        id: nextCustomerId++,
        ...customer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalPurchases: 0,
        totalSpent: 0
      };
      mockCustomers.push(newCustomer);
      return Promise.resolve({ ...newCustomer });
    }
    const response = await apiClient.post<Customer>('/customers', customer);
    return response.data;
  },

  // Update customer
  update: async (id: number, customer: CustomerCommand): Promise<Customer> => {
    if (isDemoMode) {
      const index = mockCustomers.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Customer not found');
      }
      mockCustomers[index] = {
        ...mockCustomers[index],
        ...customer,
        updatedAt: new Date().toISOString()
      };
      return Promise.resolve({ ...mockCustomers[index] });
    }
    const response = await apiClient.put<Customer>(`/customers/${id}`, customer);
    return response.data;
  },

  // Delete customer
  delete: async (id: number): Promise<void> => {
    if (isDemoMode) {
      const index = mockCustomers.findIndex(c => c.id === id);
      if (index !== -1) {
        mockCustomers.splice(index, 1);
      }
      return Promise.resolve();
    }
    await apiClient.delete(`/customers/${id}`);
  },

  // Get customer statistics
  getStats: async (): Promise<CustomerStats> => {
    if (isDemoMode) {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const newCustomersThisMonth = mockCustomers.filter(c => 
        new Date(c.createdAt) >= firstDayOfMonth
      ).length;

      const repeatCustomers = mockCustomers.filter(c => c.totalPurchases > 1).length;

      const topCustomers = [...mockCustomers]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          name: c.name,
          totalSpent: c.totalSpent,
          orderCount: c.totalPurchases
        }));

      return Promise.resolve({
        totalCustomers: mockCustomers.length,
        newCustomersThisMonth,
        repeatCustomers,
        topCustomers
      });
    }
    const response = await apiClient.get<CustomerStats>('/customers/stats');
    return response.data;
  },

  // Update customer purchase stats (called after order completion)
  updatePurchaseStats: async (customerId: number, orderAmount: number): Promise<void> => {
    if (isDemoMode) {
      const customer = mockCustomers.find(c => c.id === customerId);
      if (customer) {
        customer.totalPurchases += 1;
        customer.totalSpent += orderAmount;
        customer.lastPurchaseDate = new Date().toISOString();
        customer.updatedAt = new Date().toISOString();
      }
      return Promise.resolve();
    }
    await apiClient.post(`/customers/${customerId}/update-stats`, { orderAmount });
  }
};
