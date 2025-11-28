// Mock data for demo mode
export const DEMO_MODE = true; // Set to false when backend is ready

export const mockUser = {
  id: 1,
  name: 'Demo User',
  email: 'demo@shreeshai.com',
};

export const mockProducts = [
  {
    id: 1,
    name: 'Wheat Grains',
    category: 'Grains',
    brand: 'Shreeshai Farm Co.',
    purchasePrice: 1200,
    sellingPrice: 1500,
    stock: 150,
    sku: 'SHR-001',
    unit: 'kg',
    supplier: 'Sai Farm Supplies',
    imageUrl: '',
    active: true,
    lowStockThreshold: 20,
    minimumQuantity: 10,
  },
  {
    id: 2,
    name: 'Rice Premium',
    category: 'Grains',
    brand: 'Golden Harvest',
    purchasePrice: 2000,
    sellingPrice: 2500,
    stock: 8,
    sku: 'SHR-002',
    unit: 'kg',
    supplier: 'Rice Mills Ltd',
    imageUrl: '',
    active: true,
    lowStockThreshold: 15,
    minimumQuantity: 10,
  },
  {
    id: 3,
    name: 'Organic Fertilizer',
    category: 'Fertilizers',
    brand: 'GreenGrow',
    purchasePrice: 500,
    sellingPrice: 650,
    stock: 0,
    sku: 'SHR-003',
    unit: 'bag',
    supplier: 'Agro Chemicals',
    imageUrl: '',
    active: true,
    lowStockThreshold: 5,
    minimumQuantity: 5,
  },
  {
    id: 4,
    name: 'Tractor Oil',
    category: 'Equipment',
    brand: 'MobilAgri',
    purchasePrice: 800,
    sellingPrice: 1000,
    stock: 45,
    sku: 'SHR-004',
    unit: 'litre',
    supplier: 'Auto Parts Hub',
    imageUrl: '',
    active: true,
    lowStockThreshold: 10,
    minimumQuantity: 5,
  },
  {
    id: 5,
    name: 'Corn Seeds',
    category: 'Seeds',
    brand: 'SeedMaster',
    purchasePrice: 300,
    sellingPrice: 400,
    stock: 200,
    sku: 'SHR-005',
    unit: 'kg',
    supplier: 'Seed Distributors',
    imageUrl: '',
    active: true,
    lowStockThreshold: 30,
    minimumQuantity: 20,
  },
];

export const mockOrders = [
  {
    id: '1',
    orderId: 'ORD-001',
    customer: 'Ramesh Kumar',
    items: 3,
    total: 4500,
    status: 'PAID',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    orderId: 'ORD-002',
    customer: 'Suresh Traders',
    items: 5,
    total: 12500,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    orderId: 'ORD-003',
    customer: 'Mahesh Agro',
    items: 2,
    total: 2000,
    status: 'PAID',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    orderId: 'ORD-004',
    customer: 'Dinesh Farm',
    items: 1,
    total: 1500,
    status: 'CANCELLED',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '5',
    orderId: 'ORD-005',
    customer: 'Kisan Bazar',
    items: 10,
    total: 25000,
    status: 'PAID',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

export const mockInventorySummary = {
  totalProducts: 5,
  inStock: 3,
  lowStock: 1,
  outOfStock: 1,
};

export const mockDashboardStats = {
  totalSales: 45500,
  paidCount: 3,
  pendingCount: 1,
  cancelledCount: 1,
};

// Mock API functions with delays to simulate network
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  login: async (email: string, password: string) => {
    await delay(800);
    if (email && password) {
      return {
        token: 'demo-jwt-token-' + Date.now(),
        email: mockUser.email,
        name: mockUser.name,
        photoDataUrl: undefined,
      };
    }
    throw new Error('Invalid credentials');
  },

  register: async (data: any) => {
    await delay(800);
    return {
      token: 'demo-jwt-token-' + Date.now(),
      email: data.email,
      name: data.name,
      photoDataUrl: undefined,
    };
  },

  getCurrentUser: async () => {
    await delay(300);
    return mockUser;
  },

  getProducts: async () => {
    await delay(500);
    return mockProducts;
  },

  getProductById: async (id: number) => {
    await delay(300);
    return mockProducts.find(p => p.id === id) || null;
  },

  createProduct: async (data: any) => {
    await delay(600);
    const newProduct = {
      id: mockProducts.length + 1,
      ...data,
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: number, data: any) => {
    await delay(600);
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...data };
      return mockProducts[index];
    }
    throw new Error('Product not found');
  },

  deleteProduct: async (id: number) => {
    await delay(500);
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
    }
  },

  getInventorySummary: async () => {
    await delay(400);
    // Calculate from current mockProducts
    const total = mockProducts.length;
    const inStock = mockProducts.filter(p => p.stock > (p.lowStockThreshold || 0)).length;
    const lowStock = mockProducts.filter(p => 
      p.stock > 0 && p.stock <= (p.lowStockThreshold || 0)
    ).length;
    const outOfStock = mockProducts.filter(p => p.stock === 0).length;
    
    return {
      totalProducts: total,
      inStock,
      lowStock,
      outOfStock,
    };
  },

  getOrders: async () => {
    await delay(500);
    return mockOrders;
  },

  createOrder: async (data: any) => {
    await delay(600);
    const newOrder = {
      id: String(mockOrders.length + 1),
      orderId: data.orderId || `ORD-${String(mockOrders.length + 1).padStart(3, '0')}`,
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
    };
    mockOrders.unshift(newOrder);
    return newOrder;
  },

  getDashboardStats: async () => {
    await delay(400);
    // Calculate from current mockOrders
    const today = new Date().toDateString();
    const todayOrders = mockOrders.filter(
      o => new Date(o.createdAt).toDateString() === today
    );
    
    const totalSales = todayOrders
      .filter(o => o.status === 'PAID')
      .reduce((sum, o) => sum + o.total, 0);
    
    const paidCount = mockOrders.filter(o => o.status === 'PAID').length;
    const pendingCount = mockOrders.filter(o => o.status === 'PENDING').length;
    const cancelledCount = mockOrders.filter(o => o.status === 'CANCELLED').length;
    
    return {
      totalSales,
      paidCount,
      pendingCount,
      cancelledCount,
    };
  },
};
