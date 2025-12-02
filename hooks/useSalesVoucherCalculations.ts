import { useMemo } from 'react';
import { SalesVoucherLine, SalesVoucherTotals } from '@/app/sales/components/types';
import { calculateSalesTotals } from '@/app/sales/components/utils';

/**
 * Custom hook for sales voucher calculations
 * Follows Single Responsibility Principle - handles only calculations
 */
export function useSalesVoucherCalculations(
  lines: SalesVoucherLine[],
  otherCharges: number,
  roundOff: number,
  companyState: string,
  partyState: string
): SalesVoucherTotals {
  return useMemo(() => {
    return calculateSalesTotals(lines, otherCharges, roundOff, companyState, partyState);
  }, [lines, otherCharges, roundOff, companyState, partyState]);
}

