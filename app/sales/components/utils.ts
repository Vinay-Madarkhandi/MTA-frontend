/**
 * Utility functions for Sales Voucher calculations
 * Reuses same calculation logic as purchases (GST rules are identical)
 */

export { 
  toPaisa, 
  fromPaisa, 
  formatCurrency,
  calculateLineAmounts,
  calculateGSTComponents,
  filterProductsByQuery,
  filterPartiesByQuery
} from '@/app/purchases/components/utils';

import { SalesVoucherLine, SalesVoucherTotals } from './types';

/**
 * Calculate totals for sales voucher
 * (Same logic as purchase, different type signatures)
 */
export function calculateSalesTotals(
  lines: SalesVoucherLine[],
  otherCharges: number,
  roundOff: number,
  companyState: string,
  partyState: string
): SalesVoucherTotals {
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

