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
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    batchNumber: 'BATCH-2024-001',
    manufacturingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days from now
    batchNumber: 'BATCH-2024-002',
    manufacturingDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Already expired (2 days ago)
    batchNumber: 'BATCH-2024-003',
    manufacturingDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days from now
    batchNumber: 'BATCH-2024-004',
    manufacturingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
    batchNumber: 'BATCH-2024-005',
    manufacturingDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

// Mock Parties/Customers for Sales Module
export const mockParties = [
  {
    id: 1,
    name: 'Ramesh Kumar Trading',
    phone: '+91 98765 43210',
    email: 'ramesh.kumar@example.com',
    address: 'Shop No. 45, Main Market, Delhi',
    gstin: '07AAAAA1234A1Z5',
    openingBalance: 5000,
    currentBalance: 5000,
    creditLimit: 50000,
    partyType: 'CUSTOMER' as const,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Suresh Agro Traders',
    phone: '+91 98765 43211',
    email: 'suresh@agrotraders.com',
    address: 'Mandi Road, Punjab',
    gstin: '03BBBBB5678B2Z6',
    openingBalance: 0,
    currentBalance: 12500,
    creditLimit: 100000,
    partyType: 'CUSTOMER' as const,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Mahesh Farm House',
    phone: '+91 98765 43212',
    email: 'mahesh@farmhouse.com',
    address: 'Village Road, Maharashtra',
    gstin: '27CCCCC9012C3Z7',
    openingBalance: 2000,
    currentBalance: 8500,
    creditLimit: 75000,
    partyType: 'CUSTOMER' as const,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Dinesh Seeds & Fertilizers',
    phone: '+91 98765 43213',
    email: 'dinesh@seeds.com',
    address: 'Market Yard, Karnataka',
    gstin: '29DDDDD3456D4Z8',
    openingBalance: 1500,
    currentBalance: 3500,
    creditLimit: 60000,
    partyType: 'CUSTOMER' as const,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Kisan Bazar',
    phone: '+91 98765 43214',
    email: 'info@kisanbazar.com',
    address: 'Wholesale Market, Uttar Pradesh',
    gstin: '09EEEEE6789E5Z9',
    openingBalance: 10000,
    currentBalance: 35000,
    creditLimit: 150000,
    partyType: 'CUSTOMER' as const,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Sales Transactions
export const mockSalesTransactions = [
  {
    id: 1,
    voucherNo: 'SAL-2024-001',
    partyId: 1,
    partyName: 'Ramesh Kumar Trading',
    partyPhone: '+91 98765 43210',
    items: [
      {
        id: 1,
        productId: 1,
        productName: 'Wheat Grains',
        sku: 'SHR-001',
        availableStock: 150,
        quantity: 50,
        rate: 1500,
        amount: 75000,
        unit: 'kg'
      },
      {
        id: 2,
        productId: 2,
        productName: 'Rice Premium',
        sku: 'SHR-002',
        availableStock: 8,
        quantity: 20,
        rate: 2500,
        amount: 50000,
        unit: 'kg'
      }
    ],
    subtotal: 125000,
    cgst: 2250,
    sgst: 2250,
    igst: 0,
    totalTax: 4500,
    discount: 5000,
    discountType: 'AMOUNT' as const,
    roundOff: 0,
    grandTotal: 124500,
    paymentMode: 'CASH' as const,
    paymentStatus: 'PAID' as const,
    paidAmount: 124500,
    balanceAmount: 0,
    saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    narration: 'Bulk order for festival season',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    voucherNo: 'SAL-2024-002',
    partyId: 2,
    partyName: 'Suresh Agro Traders',
    partyPhone: '+91 98765 43211',
    items: [
      {
        id: 3,
        productId: 5,
        productName: 'Corn Seeds',
        sku: 'SHR-005',
        availableStock: 200,
        quantity: 100,
        rate: 400,
        amount: 40000,
        unit: 'kg'
      }
    ],
    subtotal: 40000,
    cgst: 1800,
    sgst: 1800,
    igst: 0,
    totalTax: 3600,
    discount: 2000,
    discountType: 'AMOUNT' as const,
    roundOff: 0,
    grandTotal: 41600,
    paymentMode: 'CREDIT' as const,
    paymentStatus: 'UNPAID' as const,
    paidAmount: 0,
    balanceAmount: 41600,
    saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    narration: 'Credit sale - 30 days payment term',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    voucherNo: 'SAL-2024-003',
    partyId: 5,
    partyName: 'Kisan Bazar',
    partyPhone: '+91 98765 43214',
    items: [
      {
        id: 4,
        productId: 4,
        productName: 'Tractor Oil',
        sku: 'SHR-004',
        availableStock: 45,
        quantity: 30,
        rate: 1000,
        amount: 30000,
        unit: 'litre'
      }
    ],
    subtotal: 30000,
    cgst: 1350,
    sgst: 1350,
    igst: 0,
    totalTax: 2700,
    discount: 1500,
    discountType: 'AMOUNT' as const,
    roundOff: 0,
    grandTotal: 31200,
    paymentMode: 'UPI' as const,
    paymentStatus: 'PARTIAL' as const,
    paidAmount: 15000,
    balanceAmount: 16200,
    saleDate: new Date().toISOString().split('T')[0],
    narration: 'Partial payment received',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Sales Stats
export const mockSalesStats = {
  totalSales: 197300,
  todaySales: 31200,
  monthSales: 197300,
  totalTransactions: 3,
  paidTransactions: 1,
  unpaidTransactions: 1,
  totalReceivable: 57800,
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

  // Sales Module Mock APIs
  getParties: async () => {
    await delay(500);
    return mockParties;
  },

  getPartiesByType: async (type: 'CUSTOMER' | 'SUPPLIER') => {
    await delay(400);
    return mockParties.filter(p => p.partyType === type);
  },

  createParty: async (data: any) => {
    await delay(600);
    const newParty = {
      id: mockParties.length + 1,
      ...data,
      openingBalance: data.openingBalance || 0,
      currentBalance: data.openingBalance || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockParties.push(newParty);
    return newParty;
  },

  getSalesTransactions: async () => {
    await delay(500);
    return mockSalesTransactions;
  },

  createSale: async (data: any) => {
    await delay(800);
    const newSale = {
      id: mockSalesTransactions.length + 1,
      voucherNo: `SAL-2024-${String(mockSalesTransactions.length + 1).padStart(3, '0')}`,
      ...data,
      totalTax: (data.cgst || 0) + (data.sgst || 0) + (data.igst || 0),
      balanceAmount: data.grandTotal - data.paidAmount,
      saleDate: data.saleDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSalesTransactions.unshift(newSale);

    // Update party balance
    const party = mockParties.find(p => p.id === data.partyId);
    if (party) {
      party.currentBalance += newSale.balanceAmount;
    }

    // Update product stock
    data.items.forEach((item: any) => {
      const product = mockProducts.find(p => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    });

    return newSale;
  },

  getSalesStats: async () => {
    await delay(400);
    return mockSalesStats;
  },

  getNextVoucherNo: async () => {
    await delay(300);
    return `SAL-2024-${String(mockSalesTransactions.length + 1).padStart(3, '0')}`;
  },

  getPartySalesSummary: async () => {
    await delay(500);
    // Group sales by party
    const partySales = mockSalesTransactions.reduce((acc: any, sale) => {
      if (!acc[sale.partyId]) {
        acc[sale.partyId] = {
          partyId: sale.partyId,
          partyName: sale.partyName,
          totalSales: 0,
          totalPaid: 0,
          totalUnpaid: 0,
          transactionCount: 0,
          lastSaleDate: sale.saleDate
        };
      }
      acc[sale.partyId].totalSales += sale.grandTotal;
      acc[sale.partyId].totalPaid += sale.paidAmount;
      acc[sale.partyId].totalUnpaid += sale.balanceAmount;
      acc[sale.partyId].transactionCount += 1;
      if (new Date(sale.saleDate) > new Date(acc[sale.partyId].lastSaleDate)) {
        acc[sale.partyId].lastSaleDate = sale.saleDate;
      }
      return acc;
    }, {});
    return Object.values(partySales);
  },

  getItemSalesSummary: async () => {
    await delay(500);
    // Group sales by item
    const itemSales: any = {};
    mockSalesTransactions.forEach(sale => {
      sale.items.forEach((item: any) => {
        if (!itemSales[item.productId]) {
          itemSales[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            quantitySold: 0,
            totalAmount: 0,
            transactionCount: 0
          };
        }
        itemSales[item.productId].quantitySold += item.quantity;
        itemSales[item.productId].totalAmount += item.amount;
        itemSales[item.productId].transactionCount += 1;
      });
    });
    return Object.values(itemSales);
  },
};
