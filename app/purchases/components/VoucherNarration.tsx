/**
 * VoucherNarration Component
 * Text area for voucher narration/notes
 * Follows Single Responsibility Principle
 */

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface VoucherNarrationProps {
  narration: string;
  taxInclusive: boolean;
  onNarrationChange: (value: string) => void;
  onTaxInclusiveChange: (value: boolean) => void;
}

export function VoucherNarration({
  narration,
  taxInclusive,
  onNarrationChange,
  onTaxInclusiveChange,
}: VoucherNarrationProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <Label>Narration / Notes</Label>
          <Textarea
            value={narration}
            onChange={(e) => onNarrationChange(e.target.value)}
            placeholder="Add any notes or remarks..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="taxInclusive"
            checked={taxInclusive}
            onCheckedChange={(checked) =>
              onTaxInclusiveChange(checked as boolean)
            }
          />
          <Label htmlFor="taxInclusive" className="cursor-pointer">
            Tax Inclusive (rates include tax)
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}

