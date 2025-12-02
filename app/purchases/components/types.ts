/**
 * Type definitions for Purchase Voucher system
 * Following Interface Segregation Principle
 */

export interface VoucherLine {
  id: string;
  productId: string;
  productName: string;
  description: string;
  qty: number;
  uom: string;
  rate: number; // rate per unit in rupees
  discountPercent: number;
  cgst: number; // CGST amount in rupees
  sgst: number; // SGST amount in rupees
  igst: number; // IGST amount in rupees
  taxRate: number; // total tax percentage
  taxAmount: number; // tax amount in rupees
  amount: number; // total amount in rupees (including tax)
}

export interface PurchaseProduct {
  id: string;
  name: string;
  hsn: string;
  rate: number;
  uom: string;
  taxRate: number;
}

export interface Ledger {
  id: string;
  name: string;
  group: string;
}

export interface VoucherParty {
  id: string;
  name: string;
  contact?: string;
  gst?: string;
  state: string; // State where party is located
}

export interface Voucher {
  voucherType: "Purchase" | "Payment" | "PR" | "Contra";
  voucherNumber: string;
  date: string;
  partyLedger: string;
  narration: string;
  lines: VoucherLine[];
  otherCharges: number;
  roundOff: number;
  taxInclusive: boolean;
  companyState: string;
  partyState: string;
}

export interface JournalEntry {
  ledger: string;
  debit: number;
  credit: number;
}

export interface VoucherTotals {
  subtotal: number;
  totalTax: number;
  igst: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
}

