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

// Purchase Module Types
export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierName: string;
  supplierContact: string;
  supplierEmail: string;
  supplierGST: string;
  supplierAddress: string;
  purchaseDate: string;
  items: PurchaseItem[];
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  shippingCharges: number;
  otherCharges: number;
  grandTotal: number;
  paymentStatus: "pending" | "partial" | "paid";
  paymentMethod: "cash" | "card" | "upi" | "netbanking" | "pos";
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseCommand {
  supplierName: string;
  supplierContact: string;
  supplierEmail: string;
  supplierGST: string;
  supplierAddress: string;
  purchaseDate: string;
  items: PurchaseItem[];
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  shippingCharges: number;
  otherCharges: number;
  grandTotal: number;
  paymentStatus: "pending" | "partial" | "paid";
  paymentMethod: "cash" | "card" | "upi" | "netbanking" | "pos";
  transactionId?: string;
  notes?: string;
}

export interface PurchaseStats {
  totalPurchases: number;
  pendingPayments: number;
  completedToday: number;
  totalAmount: number;
}

export interface PaymentRequest {
  purchaseId: string;
  amount: number;
  paymentMethod: "cash" | "card" | "upi" | "netbanking" | "pos";
  transactionId?: string;
  notes?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentStatus: "pending" | "partial" | "paid";
  message: string;
  timestamp: string;
}
