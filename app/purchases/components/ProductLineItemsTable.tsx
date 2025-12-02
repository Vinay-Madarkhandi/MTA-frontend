/**
 * ProductLineItemsTable Component
 * Main table for purchase voucher line items with keyboard navigation
 * Follows Single Responsibility Principle (handles line items display & editing)
 */

import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VoucherLine, PurchaseProduct } from './types';
import { ProductLineRow } from './ProductLineRow';

interface ProductLineItemsTableProps {
  lines: VoucherLine[];
  products: PurchaseProduct[];
  taxInclusive: boolean;
  companyState: string;
  partyState: string;
  onLineUpdate: (index: number, field: keyof VoucherLine, value: any) => void;
  onAddLine: () => void;
}

export function ProductLineItemsTable({
  lines,
  products,
  taxInclusive,
  companyState,
  partyState,
  onLineUpdate,
  onAddLine,
}: ProductLineItemsTableProps) {
  const cellRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: string }>({
    row: 0,
    col: "productName",
  });

  const columns = [
    "productName",
    "qty",
    "uom",
    "rate",
    "discountPercent",
    "taxRate",
    "amount",
  ];

  const handleKeyboardNavigation = (
    e: React.KeyboardEvent,
    rowIndex: number,
    colKey: string
  ) => {
    const colIndex = columns.indexOf(colKey);

    // Enter - move to next cell or next row
    if (e.key === "Enter") {
      e.preventDefault();
      if (colIndex < columns.length - 1) {
        const nextCell =
          cellRefs.current[`${rowIndex}-${columns[colIndex + 1]}`];
        if (nextCell) nextCell.focus();
      } else {
        // End of row - move to next row or add new line
        if (rowIndex === lines.length - 1) {
          onAddLine();
          setTimeout(() => {
            cellRefs.current[`${lines.length}-${columns[0]}`]?.focus();
          }, 50);
        } else {
          cellRefs.current[`${rowIndex + 1}-${columns[0]}`]?.focus();
        }
      }
    }

    // Tab - same as Enter
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      if (colIndex < columns.length - 1) {
        const nextCell =
          cellRefs.current[`${rowIndex}-${columns[colIndex + 1]}`];
        if (nextCell) nextCell.focus();
      }
    }

    // Shift+Tab - move backward
    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      if (colIndex > 0) {
        const prevCell =
          cellRefs.current[`${rowIndex}-${columns[colIndex - 1]}`];
        if (prevCell) prevCell.focus();
      } else if (rowIndex > 0) {
        const prevCell =
          cellRefs.current[`${rowIndex - 1}-${columns[columns.length - 1]}`];
        if (prevCell) prevCell.focus();
      }
    }

    // Arrow Up
    if (e.key === "ArrowUp" && rowIndex > 0) {
      e.preventDefault();
      const upCell = cellRefs.current[`${rowIndex - 1}-${colKey}`];
      if (upCell) upCell.focus();
    }

    // Arrow Down
    if (e.key === "ArrowDown" && rowIndex < lines.length - 1) {
      e.preventDefault();
      const downCell = cellRefs.current[`${rowIndex + 1}-${colKey}`];
      if (downCell) downCell.focus();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Line Items</CardTitle>
        <Button variant="outline" size="sm" onClick={onAddLine}>
          <Plus className="h-4 w-4 mr-2" />
          Add Line
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-sm font-medium">#</th>
                <th className="text-left p-2 text-sm font-medium min-w-[200px]">
                  Product Name
                </th>
                <th className="text-left p-2 text-sm font-medium w-20">Qty</th>
                <th className="text-left p-2 text-sm font-medium w-20">UOM</th>
                <th className="text-left p-2 text-sm font-medium w-24">Rate</th>
                <th className="text-left p-2 text-sm font-medium w-24">
                  Disc %
                </th>
                <th className="text-left p-2 text-sm font-medium w-24">
                  Tax %
                </th>
                <th className="text-left p-2 text-sm font-medium w-28">
                  CGST
                </th>
                <th className="text-left p-2 text-sm font-medium w-28">
                  SGST
                </th>
                <th className="text-left p-2 text-sm font-medium w-28">
                  IGST
                </th>
                <th className="text-right p-2 text-sm font-medium w-32">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <ProductLineRow
                  key={line.id}
                  line={line}
                  index={index}
                  products={products}
                  companyState={companyState}
                  partyState={partyState}
                  taxInclusive={taxInclusive}
                  cellRefs={cellRefs}
                  onUpdate={(field, value) => onLineUpdate(index, field, value)}
                  onKeyDown={(e, colKey) =>
                    handleKeyboardNavigation(e, index, colKey)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

