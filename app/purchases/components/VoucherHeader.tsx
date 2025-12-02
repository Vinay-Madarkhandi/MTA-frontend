/**
 * VoucherHeader Component
 * Displays voucher type, number, date selection
 * Follows Single Responsibility Principle
 */

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Voucher } from './types';

interface VoucherHeaderProps {
  voucher: Voucher;
  onUpdate: (updates: Partial<Voucher>) => void;
}

export function VoucherHeader({ voucher, onUpdate }: VoucherHeaderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Voucher Type</Label>
            <Select
              value={voucher.voucherType}
              onValueChange={(value: any) =>
                onUpdate({ voucherType: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Purchase">Purchase</SelectItem>
                <SelectItem value="Payment">Payment</SelectItem>
                <SelectItem value="PR">Payment Receipt (PR)</SelectItem>
                <SelectItem value="Contra">Contra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Voucher Number</Label>
            <Input
              value={voucher.voucherNumber}
              onChange={(e) => onUpdate({ voucherNumber: e.target.value })}
              placeholder="Auto-generated"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={voucher.date}
              onChange={(e) => onUpdate({ date: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Company State</Label>
            <Input
              value={voucher.companyState}
              onChange={(e) => onUpdate({ companyState: e.target.value })}
              placeholder="e.g., Karnataka"
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

