/**
 * Utility functions for Purchase Voucher calculations
 * Following Single Responsibility Principle
 */

import { VoucherLine, VoucherTotals } from './types';

// ============================================================================
// MONETARY CALCULATIONS (in paisa for precision)
// ============================================================================

export const toPaisa = (amount: number): number => Math.round(amount * 100);
export const fromPaisa = (paisa: number): number => paisa / 100;
export const formatCurrency = (amount: number): string =>
  `₹${Number(amount).toFixed(2)}`;

// ============================================================================
// LINE ITEM CALCULATIONS
// ============================================================================

export function calculateLineAmounts(
  line: Partial<VoucherLine>,
  taxInclusive: boolean
): { taxAmount: number; amount: number; baseAmount: number } {
  const qty = line.qty || 0;
  const rate = toPaisa(line.rate || 0);
  const discountPercent = line.discountPercent || 0;
  const taxRate = line.taxRate || 0;

  let baseAmount = qty * rate;
  const discountAmount = Math.round((baseAmount * discountPercent) / 100);
  baseAmount = baseAmount - discountAmount;

  let taxAmount = 0;
  let amount = 0;

  if (taxInclusive) {
    amount = baseAmount;
    taxAmount = Math.round((baseAmount * taxRate) / (100 + taxRate));
  } else {
    taxAmount = Math.round((baseAmount * taxRate) / 100);
    amount = baseAmount + taxAmount;
  }

  return { taxAmount, amount, baseAmount };
}

// ============================================================================
// VOUCHER TOTALS CALCULATION
// ============================================================================

export function calculateTotals(
  lines: VoucherLine[],
  otherCharges: number,
  roundOff: number,
  companyState: string,
  partyState: string
): VoucherTotals {
  const subtotal = lines.reduce(
    (sum, line) => sum + (line.amount - line.taxAmount),
    0
  );
  const totalTax = lines.reduce((sum, line) => sum + line.taxAmount, 0);

  const isInterstate = companyState !== partyState;
  const igst = isInterstate ? totalTax : 0;
  const cgst = !isInterstate ? totalTax / 2 : 0;
  const sgst = !isInterstate ? totalTax / 2 : 0;

  const grandTotal = subtotal + totalTax + otherCharges + roundOff;

  return { subtotal, totalTax, igst, cgst, sgst, grandTotal };
}

// ============================================================================
// GST CALCULATIONS
// ============================================================================

export function calculateGSTComponents(
  line: VoucherLine,
  companyState: string,
  partyState: string
): { cgst: number; sgst: number; igst: number } {
  const isInterstate = companyState !== partyState;
  const taxAmount = line.taxAmount;

  if (isInterstate) {
    return { cgst: 0, sgst: 0, igst: taxAmount };
  } else {
    const halfTax = taxAmount / 2;
    return { cgst: halfTax, sgst: halfTax, igst: 0 };
  }
}

// ============================================================================
// PRODUCT SEARCH & FILTER
// ============================================================================

export function filterProductsByQuery(
  products: any[],
  query: string
): any[] {
  if (!query.trim()) return products;
  
  const searchTerm = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm) ||
      product.sku?.toLowerCase().includes(searchTerm) ||
      product.id?.toString().includes(searchTerm)
  );
}

// ============================================================================
// PARTY/LEDGER SEARCH & FILTER
// ============================================================================

export function filterPartiesByQuery(
  parties: any[],
  query: string
): any[] {
  if (!query.trim()) return parties;
  
  const searchTerm = query.toLowerCase();
  return parties.filter(
    (party) =>
      party.name?.toLowerCase().includes(searchTerm) ||
      party.phone?.includes(searchTerm) ||
      party.gstin?.toLowerCase().includes(searchTerm)
  );
}

