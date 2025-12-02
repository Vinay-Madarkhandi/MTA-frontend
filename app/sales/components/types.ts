/**
 * Type definitions for Sales Voucher system
 * Following Interface Segregation Principle
 */

export interface SalesVoucherLine {
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

export interface SalesProduct {
  id: string;
  name: string;
  hsn: string;
  rate: number;
  uom: string;
  taxRate: number;
  availableStock: number; // In stock quantity
}

export interface SalesParty {
  id: string;
  name: string;
  contact?: string;
  gst?: string;
  state: string; // State where party is located
}

export interface SalesVoucher {
  voucherType: "Sales" | "Payment" | "Receipt" | "Contra";
  voucherNumber: string;
  date: string;
  partyLedger: string;
  narration: string;
  lines: SalesVoucherLine[];
  otherCharges: number;
  roundOff: number;
  taxInclusive: boolean;
  companyState: string;
  partyState: string;
}

export interface SalesJournalEntry {
  ledger: string;
  debit: number;
  credit: number;
}

export interface SalesVoucherTotals {
  subtotal: number;
  totalTax: number;
  igst: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
}

