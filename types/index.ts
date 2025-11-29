// api-types.ts
// Consolidated/merged API types from both files.

export interface User {
  id?: number;
  email: string;
  name: string;
  photoDataUrl?: string;
  state?: string;
  preferredLanguage?: string; // kept from second file (preferredLanguage / language)
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
  language?: string; // kept for compatibility with older clients
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Product model - merged fields from both sources.
 * Notes:
 *  - `stock` is retained for backward compatibility but treated as alias of `currentStock`.
 *  - `lowStockThreshold` is kept and aliased to `reorderLevel`.
 */
export interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  description?: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  stock: number; // alias for currentStock (kept for backward compatibility)
  sku: string;
  barcode?: string;
  qrCode?: string;
  unit: string;
  gstPercent?: number;
  hsnCode?: string;
  supplier: string;
  imageUrl?: string;
  active: boolean;
  reorderLevel?: number; // present in second file
  lowStockThreshold?: number; // alias for reorderLevel (kept)
  minimumQuantity?: number;
  totalValue?: number;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  expiryDate?: string;
  batchNumber?: string;
  manufacturingDate?: string;
  expiryStatus?: 'EXPIRED' | 'NEAR_EXPIRY' | 'SAFE' | 'NO_EXPIRY';
  daysUntilExpiry?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * ProductCommand - used when creating/updating products
 * Mirrors Product but intended for input payloads.
 */
export interface ProductCommand {
  name: string;
  category: string;
  brand: string;
  description?: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  stock: number; // alias for currentStock
  sku: string;
  barcode?: string;
  unit: string;
  gstPercent?: number;
  hsnCode?: string;
  supplier: string;
  imageUrl?: string;
  active: boolean;
  reorderLevel?: number;
  lowStockThreshold?: number; // alias
  minimumQuantity?: number;
  expiryDate?: string;
  batchNumber?: string;
  manufacturingDate?: string;
}

/**
 * Order-related types
 */
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
  // merged: either string-based or id-based depending on client
  customer?: string;
  customerId: number;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod?: 'CASH' | 'CARD' | 'UPI' | 'OTHER';
  paymentStatus?: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  notes?: string;
  orderId?: string;
}

/**
 * OrderItem used within customer-facing order shapes
 */
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Customer management
 */
export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate?: string;
}

export interface CustomerCommand {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

/**
 * Complete order with customer & items
 */
export interface CustomerOrder {
  id: number;
  orderId: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod?: 'CASH' | 'CARD' | 'UPI' | 'OTHER';
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  orderDate: string;
  notes?: string;
}

/**
 * Inventory & dashboard summaries
 */
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

/**
 * Purchase module
 */
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
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod: 'cash' | 'card' | 'upi' | 'netbanking' | 'pos';
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
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod: 'cash' | 'card' | 'upi' | 'netbanking' | 'pos';
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
  paymentMethod: 'cash' | 'card' | 'upi' | 'netbanking' | 'pos';
  transactionId?: string;
  notes?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  message: string;
  timestamp: string;
}

/**
 * Party / ledger / tally-style types
 */
export interface Party {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  openingBalance: number;
  currentBalance: number;
  creditLimit?: number;
  partyType: 'CUSTOMER' | 'SUPPLIER';
  createdAt: string;
  updatedAt: string;
}

export interface PartyCommand {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  openingBalance?: number;
  creditLimit?: number;
  partyType: 'CUSTOMER' | 'SUPPLIER';
}

/**
 * Sales / voucher types
 */
export interface SaleItem {
  id?: number;
  productId: number;
  productName: string;
  sku: string;
  availableStock: number;
  quantity: number;
  rate: number;
  amount: number;
  unit: string;
  customItemName?: string;
}

export interface SaleTransaction {
  id: number;
  voucherNo: string;
  partyId: number;
  partyName: string;
  partyPhone: string;
  items: SaleItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  discount: number;
  discountType: 'AMOUNT' | 'PERCENTAGE';
  roundOff: number;
  grandTotal: number;
  paymentMode: 'CASH' | 'CREDIT' | 'CARD' | 'UPI' | 'BANK_TRANSFER';
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL';
  paidAmount: number;
  balanceAmount: number;
  saleDate: string;
  dueDate?: string;
  narration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleCommand {
  partyId: number;
  items: {
    productId: number;
    quantity: number;
    rate: number;
  }[];
  subtotal: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  discount?: number;
  discountType?: 'AMOUNT' | 'PERCENTAGE';
  roundOff?: number;
  grandTotal: number;
  paymentMode: 'CASH' | 'CREDIT' | 'CARD' | 'UPI' | 'BANK_TRANSFER';
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL';
  paidAmount: number;
  saleDate?: string;
  dueDate?: string;
  narration?: string;
}

/**
 * Reporting / stats
 */
export interface SalesStats {
  totalSales: number;
  todaySales: number;
  monthSales: number;
  totalTransactions: number;
  paidTransactions: number;
  unpaidTransactions: number;
  totalReceivable: number;
}

export interface PartySalesSummary {
  partyId: number;
  partyName: string;
  totalSales: number;
  totalPaid: number;
  totalUnpaid: number;
  transactionCount: number;
  lastSaleDate: string;
}

export interface ItemSalesSummary {
  productId: number;
  productName: string;
  sku: string;
  quantitySold: number;
  totalAmount: number;
  transactionCount: number;
}

/**
 * Expiry management
 */
export interface ExpiryAlertThreshold {
  id: number;
  name: string;
  days: number;
  color: string;
  enabled: boolean;
}

export interface NearExpiryProduct extends Product {
  daysUntilExpiry: number;
  expiryStatus: 'EXPIRED' | 'NEAR_EXPIRY' | 'SAFE';
  alertLevel: 'CRITICAL' | 'WARNING' | 'INFO';
}

export interface ExpiryStats {
  expiredCount: number;
  nearExpiryCount: number;
  totalWithExpiry: number;
  expiryValue: number;
}

/**
 * Customer stats
 */
export interface CustomerStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  repeatCustomers: number;
  topCustomers: {
    id: number;
    name: string;
    totalSpent: number;
    orderCount: number;
  }[];
}
