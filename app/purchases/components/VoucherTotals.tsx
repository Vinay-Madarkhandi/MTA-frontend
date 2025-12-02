/**
 * VoucherTotals Component  
 * Displays subtotal, taxes, and grand total
 * Follows Single Responsibility Principle
 */

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoucherTotals as VoucherTotalsType } from './types';
import { formatCurrency, fromPaisa } from './utils';

interface VoucherTotalsProps {
  totals: VoucherTotalsType;
  otherCharges: number;
  roundOff: number;
  onOtherChargesChange: (value: number) => void;
  onRoundOffChange: (value: number) => void;
}

export function VoucherTotals({
  totals,
  otherCharges,
  roundOff,
  onOtherChargesChange,
  onRoundOffChange,
}: VoucherTotalsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - Charges */}
          <div className="space-y-3">
            <div>
              <Label>Other Charges</Label>
              <Input
                type="number"
                step="0.01"
                value={fromPaisa(otherCharges)}
                onChange={(e) =>
                  onOtherChargesChange(
                    Math.round(parseFloat(e.target.value || "0") * 100)
                  )
                }
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Round Off</Label>
              <Input
                type="number"
                step="0.01"
                value={fromPaisa(roundOff)}
                onChange={(e) =>
                  onRoundOffChange(
                    Math.round(parseFloat(e.target.value || "0") * 100)
                  )
                }
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>

          {/* Right side - Totals */}
          <div className="space-y-2 bg-muted p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">
                {formatCurrency(fromPaisa(totals.subtotal))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>CGST:</span>
              <span className="font-medium">
                {formatCurrency(fromPaisa(totals.cgst))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>SGST:</span>
              <span className="font-medium">
                {formatCurrency(fromPaisa(totals.sgst))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IGST:</span>
              <span className="font-medium">
                {formatCurrency(fromPaisa(totals.igst))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Tax:</span>
              <span className="font-medium">
                {formatCurrency(fromPaisa(totals.totalTax))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Other Charges:</span>
              <span className="font-medium">
                {formatCurrency(fromPaisa(otherCharges))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Round Off:</span>
              <span className="font-medium">
                {formatCurrency(fromPaisa(roundOff))}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Grand Total:</span>
              <span className="text-primary">
                {formatCurrency(fromPaisa(totals.grandTotal))}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

