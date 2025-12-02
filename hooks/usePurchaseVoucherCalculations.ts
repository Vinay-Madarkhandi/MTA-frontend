import { useMemo } from 'react';
import { VoucherLine, VoucherTotals } from '@/app/purchases/components/types';

/**
 * Custom hook for purchase voucher calculations
 * Follows Single Responsibility Principle - handles only calculations
 */
export function usePurchaseVoucherCalculations(
  lines: VoucherLine[],
  otherCharges: number,
  roundOff: number,
  companyState: string,
  partyState: string
): VoucherTotals {
  return useMemo(() => {
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
  }, [lines, otherCharges, roundOff, companyState, partyState]);
}

