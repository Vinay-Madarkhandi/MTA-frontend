// API Types
export interface User {
  id?: number;
  email: string;
  name: string;
  photoDataUrl?: string;
  state?: string;
  preferredLanguage?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  photoDataUrl?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  photoDataUrl?: string;
  state?: string;
  language?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  sku: string;
  unit: string;
  supplier: string;
  imageUrl?: string;
  active: boolean;
  lowStockThreshold: number;
  minimumQuantity: number;
  totalValue?: number;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface ProductCommand {
  name: string;
  category: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  sku: string;
  unit: string;
  supplier: string;
  imageUrl?: string;
  active: boolean;
  lowStockThreshold: number;
  minimumQuantity: number;
}

export interface Order {
  id: string;
  orderId: string;
  customer: string;
  items: number;
  total: number;
  status: string;
  createdAt: string;
}

export interface OrderCommand {
  customer: string;
  items: number;
  total: number;
  status?: string;
  orderId?: string;
}

export interface InventorySummary {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface DashboardStats {
  totalSales: number;
  pendingCount: number;
  paidCount: number;
  cancelledCount: number;
}
