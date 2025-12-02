/**
 * VoucherActions Component
 * Action buttons for saving, posting, printing, etc.
 * Follows Single Responsibility Principle
 */

import { Button } from "@/components/ui/button";
import { Save, FileText, Printer, Calculator } from "lucide-react";

interface VoucherActionsProps {
  onSaveDraft: () => void;
  onPost: () => void;
  onPrint: () => void;
  onViewJournal: () => void;
}

export function VoucherActions({
  onSaveDraft,
  onPost,
  onPrint,
  onViewJournal,
}: VoucherActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={onSaveDraft}>
        <Save className="h-4 w-4 mr-2" />
        Save Draft
      </Button>
      <Button onClick={onPost}>
        <FileText className="h-4 w-4 mr-2" />
        Post Voucher
      </Button>
      <Button variant="outline" onClick={onPrint}>
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button variant="outline" onClick={onViewJournal}>
        <Calculator className="h-4 w-4 mr-2" />
        View Journal
      </Button>
    </div>
  );
}

