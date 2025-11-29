import { apiClient } from '../api-client';
import { CustomerOrder, OrderCommand, OrderItem } from '@/types';

// Check if demo mode is enabled
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Mock data for demo mode
const mockOrders: CustomerOrder[] = [
  {
    id: 1,
    orderId: 'ORD-2024-001',
    customerId: 1,
    customerName: 'Rajesh Kumar',
    customerPhone: '+91 98765 43210',
    items: [
      {
        id: 1,
        productId: 1,
        productName: 'Basmati Rice Premium',
        sku: 'RICE-BAS-001',
        quantity: 5,
        unitPrice: 120.00,
        totalPrice: 600.00
      },
      {
        id: 2,
        productId: 3,
        productName: 'Wheat Flour',
        sku: 'WHEAT-001',
        quantity: 10,
        unitPrice: 45.00,
        totalPrice: 450.00
      }
    ],
    subtotal: 1050.00,
    tax: 52.50,
    discount: 0,
    totalAmount: 1102.50,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    orderDate: '2024-11-20T15:45:00Z',
    notes: 'Regular customer, prefers morning delivery'
  },
  {
    id: 2,
    orderId: 'ORD-2024-002',
    customerId: 2,
    customerName: 'Priya Sharma',
    customerPhone: '+91 87654 32109',
    items: [
      {
        id: 3,
        productId: 2,
        productName: 'Toor Dal',
        sku: 'DAL-TOOR-001',
        quantity: 2,
        unitPrice: 110.00,
        totalPrice: 220.00
      },
      {
        id: 4,
        productId: 5,
        productName: 'Cooking Oil',
        sku: 'OIL-001',
        quantity: 3,
        unitPrice: 180.00,
        totalPrice: 540.00
      }
    ],
    subtotal: 760.00,
    tax: 38.00,
    discount: 50.00,
    totalAmount: 748.00,
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    orderDate: '2024-11-18T11:20:00Z'
  },
  {
    id: 3,
    orderId: 'ORD-2024-003',
    customerId: 4,
    customerName: 'Sneha Reddy',
    customerPhone: '+91 65432 10987',
    items: [
      {
        id: 5,
        productId: 1,
        productName: 'Basmati Rice Premium',
        sku: 'RICE-BAS-001',
        quantity: 10,
        unitPrice: 120.00,
        totalPrice: 1200.00
      }
    ],
    subtotal: 1200.00,
    tax: 60.00,
    discount: 0,
    totalAmount: 1260.00,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    orderDate: '2024-11-22T10:15:00Z',
    notes: 'Bulk order for family function'
  }
];

let nextOrderId = 4;
let nextOrderNumber = 4;

export const customerOrderApi = {
  // Get all orders
  getAll: async (): Promise<CustomerOrder[]> => {
    if (isDemoMode) {
      return Promise.resolve([...mockOrders].sort((a, b) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      ));
    }
    const response = await apiClient.get<CustomerOrder[]>('/orders');
    return response.data;
  },

  // Get order by ID
  getById: async (id: number): Promise<CustomerOrder> => {
    if (isDemoMode) {
      const order = mockOrders.find(o => o.id === id);
      if (!order) {
        throw new Error('Order not found');
      }
      return Promise.resolve({ ...order });
    }
    const response = await apiClient.get<CustomerOrder>(`/orders/${id}`);
    return response.data;
  },

  // Get orders by customer ID
  getByCustomerId: async (customerId: number): Promise<CustomerOrder[]> => {
    if (isDemoMode) {
      const customerOrders = mockOrders
        .filter(o => o.customerId === customerId)
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      return Promise.resolve([...customerOrders]);
    }
    const response = await apiClient.get<CustomerOrder[]>(`/orders/customer/${customerId}`);
    return response.data;
  },

  // Create new order
  create: async (order: OrderCommand): Promise<CustomerOrder> => {
    if (isDemoMode) {
      // Generate order ID
      const orderNumber = String(nextOrderNumber++).padStart(3, '0');
      const orderId = `ORD-${new Date().getFullYear()}-${orderNumber}`;

      // Find customer details
      const customer = await import("./customers").then(m => 
        m.customerApi.getById(order.customerId)
      );

      // Get product details for items
      const productApi = await import('./products').then(m => m.productApi);
      const itemsWithDetails: OrderItem[] = await Promise.all(
        order.items.map(async (item: { productId: number; quantity: number; unitPrice: number }, index: number) => {
          const product = await productApi.getById(item.productId);
          return {
            id: nextOrderId * 100 + index,
            productId: item.productId,
            productName: product.name,
            sku: product.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice
          };
        })
      );

      const newOrder: CustomerOrder = {
        id: nextOrderId++,
        orderId,
        customerId: order.customerId,
        customerName: customer.name,
        customerPhone: customer.phone,
        items: itemsWithDetails,
        subtotal: order.subtotal,
        tax: order.tax,
        discount: order.discount,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus || 'PENDING',
        orderDate: new Date().toISOString(),
        notes: order.notes
      };

      mockOrders.push(newOrder);

      // Update customer stats
      if (order.paymentStatus === 'PAID') {
        const customerApi = await import('./customers').then(m => m.customerApi);
        await customerApi.updatePurchaseStats(order.customerId, order.totalAmount);
      }

      return Promise.resolve({ ...newOrder });
    }
    const response = await apiClient.post<CustomerOrder>('/orders', order);
    return response.data;
  },

  // Update order status
  updateStatus: async (
    id: number, 
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
  ): Promise<CustomerOrder> => {
    if (isDemoMode) {
      const order = mockOrders.find(o => o.id === id);
      if (!order) {
        throw new Error('Order not found');
      }
      
      const oldStatus = order.paymentStatus;
      order.paymentStatus = status;

      // Update customer stats when order is marked as paid
      if (status === 'PAID' && oldStatus !== 'PAID') {
        const customerApi = await import('./customers').then(m => m.customerApi);
        await customerApi.updatePurchaseStats(order.customerId, order.totalAmount);
      }

      return Promise.resolve({ ...order });
    }
    const response = await apiClient.put<CustomerOrder>(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Delete order
  delete: async (id: number): Promise<void> => {
    if (isDemoMode) {
      const index = mockOrders.findIndex(o => o.id === id);
      if (index !== -1) {
        mockOrders.splice(index, 1);
      }
      return Promise.resolve();
    }
    await apiClient.delete(`/orders/${id}`);
  },

  // Get orders by date range
  getByDateRange: async (startDate: string, endDate: string): Promise<CustomerOrder[]> => {
    if (isDemoMode) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const filtered = mockOrders.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= start && orderDate <= end;
      });
      return Promise.resolve([...filtered].sort((a, b) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      ));
    }
    const response = await apiClient.get<CustomerOrder[]>(
      `/orders/date-range?start=${startDate}&end=${endDate}`
    );
    return response.data;
  },

  // Get order statistics
  getStats: async (): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersToday: number;
    revenueToday: number;
  }> => {
    if (isDemoMode) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const paidOrders = mockOrders.filter(o => o.paymentStatus === 'PAID');
      const ordersToday = paidOrders.filter(o => 
        new Date(o.orderDate) >= today
      );

      const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const revenueToday = ordersToday.reduce((sum, o) => sum + o.totalAmount, 0);

      return Promise.resolve({
        totalOrders: paidOrders.length,
        totalRevenue,
        averageOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
        ordersToday: ordersToday.length,
        revenueToday
      });
    }
    const response = await apiClient.get<{ totalOrders: number; totalRevenue: number; averageOrderValue: number; ordersToday: number; revenueToday: number }>('/orders/stats');
    return response.data;
  }
};
