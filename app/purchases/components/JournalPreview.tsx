/**
 * JournalPreview Component
 * Shows accounting journal entries for the voucher
 * Follows Single Responsibility Principle
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VoucherLine, VoucherTotals } from './types';
import { formatCurrency, fromPaisa } from './utils';

interface JournalEntry {
  ledger: string;
  debit: number;
  credit: number;
}

interface JournalPreviewProps {
  open: boolean;
  onClose: () => void;
  partyLedger: string;
  lines: VoucherLine[];
  totals: VoucherTotals;
}

export function JournalPreview({
  open,
  onClose,
  partyLedger,
  lines,
  totals,
}: JournalPreviewProps) {
  const generateJournalEntries = (): JournalEntry[] => {
    const entries: JournalEntry[] = [];

    // Purchase Account (Debit)
    const purchaseAmount = lines.reduce(
      (sum, line) => sum + (line.amount - line.taxAmount),
      0
    );
    if (purchaseAmount > 0) {
      entries.push({
        ledger: "Purchase Account",
        debit: purchaseAmount,
        credit: 0,
      });
    }

    // Tax Entries
    if (totals.cgst > 0) {
      entries.push({
        ledger: "CGST Input",
        debit: totals.cgst,
        credit: 0,
      });
    }
    if (totals.sgst > 0) {
      entries.push({
        ledger: "SGST Input",
        debit: totals.sgst,
        credit: 0,
      });
    }
    if (totals.igst > 0) {
      entries.push({
        ledger: "IGST Input",
        debit: totals.igst,
        credit: 0,
      });
    }

    // Party Ledger (Credit)
    entries.push({
      ledger: partyLedger || "Sundry Creditors",
      debit: 0,
      credit: totals.grandTotal,
    });

    return entries;
  };

  const journalEntries = generateJournalEntries();
  const totalDebit = journalEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = journalEntries.reduce((sum, e) => sum + e.credit, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Journal Entry Preview</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-muted">
                <th className="border p-3 text-left font-medium">Ledger Account</th>
                <th className="border p-3 text-right font-medium">Debit</th>
                <th className="border p-3 text-right font-medium">Credit</th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.map((entry, index) => (
                <tr key={index} className="hover:bg-accent/30">
                  <td className="border p-3">{entry.ledger}</td>
                  <td className="border p-3 text-right">
                    {entry.debit > 0
                      ? formatCurrency(fromPaisa(entry.debit))
                      : "-"}
                  </td>
                  <td className="border p-3 text-right">
                    {entry.credit > 0
                      ? formatCurrency(fromPaisa(entry.credit))
                      : "-"}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted font-bold">
                <td className="border p-3">Total</td>
                <td className="border p-3 text-right">
                  {formatCurrency(fromPaisa(totalDebit))}
                </td>
                <td className="border p-3 text-right">
                  {formatCurrency(fromPaisa(totalCredit))}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 p-3 rounded-md bg-muted">
            <p className="text-sm">
              <strong>Status:</strong>{" "}
              {totalDebit === totalCredit ? (
                <span className="text-green-600">✓ Balanced</span>
              ) : (
                <span className="text-destructive">
                  ✗ Not Balanced (Debit: {formatCurrency(fromPaisa(totalDebit))}, 
                  Credit: {formatCurrency(fromPaisa(totalCredit))})
                </span>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

