/**
 * ProductLineRow Component
 * Single row in purchase voucher line items table
 * Handles product selection, calculations, and inline editing
 */

import { useState, useEffect, MutableRefObject } from "react";
import { Input } from "@/components/ui/input";
import { VoucherLine, PurchaseProduct } from './types';
import { calculateLineAmounts, calculateGSTComponents, formatCurrency, fromPaisa } from './utils';

interface ProductLineRowProps {
  line: VoucherLine;
  index: number;
  products: PurchaseProduct[];
  companyState: string;
  partyState: string;
  taxInclusive: boolean;
  cellRefs: MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  onUpdate: (field: keyof VoucherLine, value: any) => void;
  onKeyDown: (e: React.KeyboardEvent, colKey: string) => void;
}

export function ProductLineRow({
  line,
  index,
  products,
  companyState,
  partyState,
  taxInclusive,
  cellRefs,
  onUpdate,
  onKeyDown,
}: ProductLineRowProps) {
  const [productSearchQuery, setProductSearchQuery] = useState(line.productName || "");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<PurchaseProduct[]>(products);

  // Filter products based on search query
  useEffect(() => {
    if (productSearchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const query = productSearchQuery.toLowerCase();
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.hsn && p.hsn.toLowerCase().includes(query)) ||
          p.id.toString().toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [productSearchQuery, products]);

  const handleProductSelect = (product: PurchaseProduct) => {
    setProductSearchQuery(product.name);
    onUpdate("productName", product.name);
    onUpdate("productId", product.id);
    onUpdate("rate", product.rate);
    onUpdate("taxRate", product.taxRate);
    onUpdate("uom", product.uom);
    setShowProductDropdown(false);

    // Focus next cell
    setTimeout(() => {
      cellRefs.current[`${index}-qty`]?.focus();
    }, 50);
  };

  const handleLineFieldChange = (field: keyof VoucherLine, value: any) => {
    onUpdate(field, value);

    // Recalculate amounts if quantity, rate, discount, or tax changes
    if (["qty", "rate", "discountPercent", "taxRate"].includes(field)) {
      const updatedLine = { ...line, [field]: value };
      const { taxAmount, amount } = calculateLineAmounts(updatedLine, taxInclusive);
      const gst = calculateGSTComponents(
        { ...updatedLine, taxAmount, amount },
        companyState,
        partyState
      );

      onUpdate("taxAmount", taxAmount);
      onUpdate("amount", amount);
      onUpdate("cgst", gst.cgst);
      onUpdate("sgst", gst.sgst);
      onUpdate("igst", gst.igst);
    }
  };

  return (
    <tr className="border-b hover:bg-accent/50">
      {/* Row Number */}
      <td className="p-2 text-sm text-muted-foreground">{index + 1}</td>

      {/* Product Name with Autocomplete */}
      <td className="p-2 relative">
        <Input
          ref={(el) => { cellRefs.current[`${index}-productName`] = el }}
          value={productSearchQuery}
          onChange={(e) => {
            setProductSearchQuery(e.target.value);
            setShowProductDropdown(true);
          }}
          onFocus={() => {
            setShowProductDropdown(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              // Try to match exact product name
              const exactMatch = products.find(
                (p) => p.name.toLowerCase() === productSearchQuery.toLowerCase()
              );
              if (exactMatch) {
                handleProductSelect(exactMatch);
              }
              setShowProductDropdown(false);
            }, 200);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filteredProducts.length > 0) {
              e.preventDefault();
              handleProductSelect(filteredProducts[0]);
            } else {
              onKeyDown(e, "productName");
            }
          }}
          placeholder="Search item..."
          className="w-full"
        />

        {/* Product Dropdown */}
        {showProductDropdown && filteredProducts.length > 0 && (
          <div
            className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-xl max-h-48 overflow-auto z-50 min-w-[300px]"
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="px-3 py-2 hover:bg-accent cursor-pointer"
                onClick={() => handleProductSelect(product)}
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-muted-foreground">
                  HSN: {product.hsn || 'N/A'} | Rate: ₹{product.rate} | Tax: {product.taxRate}%
                </div>
              </div>
            ))}
          </div>
        )}
      </td>

      {/* Quantity */}
      <td className="p-2">
        <Input
          ref={(el) => { cellRefs.current[`${index}-qty`] = el }}
          type="number"
          step="0.01"
          value={line.qty || ""}
          onChange={(e) =>
            handleLineFieldChange("qty", parseFloat(e.target.value || "0"))
          }
          onKeyDown={(e) => onKeyDown(e, "qty")}
          className="w-full"
        />
      </td>

      {/* UOM */}
      <td className="p-2">
        <Input
          ref={(el) => { cellRefs.current[`${index}-uom`] = el }}
          value={line.uom}
          onChange={(e) => onUpdate("uom", e.target.value)}
          onKeyDown={(e) => onKeyDown(e, "uom")}
          className="w-full"
        />
      </td>

      {/* Rate */}
      <td className="p-2">
        <Input
          ref={(el) => { cellRefs.current[`${index}-rate`] = el }}
          type="number"
          step="0.01"
          value={line.rate || ""}
          onChange={(e) =>
            handleLineFieldChange("rate", parseFloat(e.target.value || "0"))
          }
          onKeyDown={(e) => onKeyDown(e, "rate")}
          className="w-full"
        />
      </td>

      {/* Discount % */}
      <td className="p-2">
        <Input
          ref={(el) => { cellRefs.current[`${index}-discountPercent`] = el }}
          type="number"
          step="0.01"
          value={line.discountPercent || ""}
          onChange={(e) =>
            handleLineFieldChange(
              "discountPercent",
              parseFloat(e.target.value || "0")
            )
          }
          onKeyDown={(e) => onKeyDown(e, "discountPercent")}
          className="w-full"
        />
      </td>

      {/* Tax Rate % */}
      <td className="p-2">
        <Input
          ref={(el) => { cellRefs.current[`${index}-taxRate`] = el }}
          type="number"
          step="0.01"
          value={line.taxRate || ""}
          onChange={(e) =>
            handleLineFieldChange("taxRate", parseFloat(e.target.value || "0"))
          }
          onKeyDown={(e) => onKeyDown(e, "taxRate")}
          className="w-full"
        />
      </td>

      {/* CGST (Read-only) */}
      <td className="p-2 text-sm text-right">{formatCurrency(fromPaisa(line.cgst))}</td>

      {/* SGST (Read-only) */}
      <td className="p-2 text-sm text-right">{formatCurrency(fromPaisa(line.sgst))}</td>

      {/* IGST (Read-only) */}
      <td className="p-2 text-sm text-right">{formatCurrency(fromPaisa(line.igst))}</td>

      {/* Amount (Read-only) */}
      <td
        ref={(el) => { cellRefs.current[`${index}-amount`] = el as any }}
        className="p-2 text-sm text-right font-medium"
      >
        {formatCurrency(fromPaisa(line.amount))}
      </td>
    </tr>
  );
}

