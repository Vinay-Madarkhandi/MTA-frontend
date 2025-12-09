"use client";

/**
 * Purchase Return Page
 * Complete UI for creating purchase returns with stock reversal
 */

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useSuppliers } from "@/hooks/useParties";
import { purchaseApi, PurchaseTransaction } from "@/lib/api/purchases";
import purchaseReturnApi, {
  PurchaseReturn,
  PurchaseReturnItem,
  PurchaseReturnCommand,
  PurchaseReturnItemCommand,
} from "@/lib/api/purchase-returns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check, X, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReturnItem {
  purchaseItemId: number;
  productId: number;
  productName: string;
  originalQuantity: number;
  alreadyReturnedQuantity: number;
  remainingQuantity: number;
  returnQuantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export default function PurchaseReturnPage() {
  // ==================== DATA FETCHING ====================
  const { parties: suppliers } = useSuppliers();

  // ==================== STATE ====================
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    null
  );
  const [supplierPurchases, setSupplierPurchases] = useState<
    PurchaseTransaction[]
  >([]);
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseTransaction | null>(null);
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [returnReason, setReturnReason] = useState<string>("DAMAGED");
  const [adjustmentType, setAdjustmentType] =
    useState<string>("ADJUST_IN_NEXT");
  const [refundMethod, setRefundMethod] = useState<string>("CASH");
  const [bankName, setBankName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [refundReferenceNo, setRefundReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);

  // UI State
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [companyState] = useState("Karnataka");
  const [supplierState, setSupplierState] = useState("Karnataka");

  // ==================== EFFECTS ====================

  // Load purchases when supplier is selected
  useEffect(() => {
    if (selectedSupplierId) {
      loadSupplierPurchases(selectedSupplierId);
      const supplier = suppliers.find((s) => s.id === selectedSupplierId);
      if (supplier && supplier.address) {
        // Simple state extraction from address
        setSupplierState("Karnataka"); // Default, you can enhance this logic
      }
    } else {
      setSupplierPurchases([]);
      setSelectedPurchase(null);
      setReturnItems([]);
    }
  }, [selectedSupplierId]);

  // ==================== FUNCTIONS ====================

  const loadSupplierPurchases = async (supplierId: number) => {
    setLoadingPurchases(true);
    try {
      const purchases = await purchaseApi.getPurchasesBySupplier(supplierId);
      setSupplierPurchases(purchases || []);
    } catch (err: any) {
      setError("Failed to load supplier purchases");
      setSupplierPurchases([]);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handlePurchaseSelection = async (purchaseId: number) => {
    try {
      const purchase = await purchaseApi.getPurchaseById(purchaseId);
      setSelectedPurchase(purchase);

      // Fetch already returned quantities for this purchase
      let existingReturns: PurchaseReturn[] = [];
      try {
        existingReturns =
          await purchaseReturnApi.getPurchaseReturnsByPurchaseId(purchaseId);
        console.log("🔍 Existing returns for purchase:", existingReturns);
      } catch (returnErr: any) {
        console.error("❌ Error fetching existing returns:", returnErr);
        // Continue even if fetching returns fails (might be first return)
        existingReturns = [];
      }

      // Calculate already returned quantities per item
      const returnedQuantitiesMap = new Map<number, number>();
      existingReturns.forEach((returnRecord) => {
        returnRecord.items?.forEach((returnItem: PurchaseReturnItem) => {
          const currentReturned =
            returnedQuantitiesMap.get(returnItem.purchaseItemId) || 0;
          returnedQuantitiesMap.set(
            returnItem.purchaseItemId,
            currentReturned + returnItem.returnQuantity
          );
        });
      });

      console.log(
        "📊 Returned quantities map:",
        Object.fromEntries(returnedQuantitiesMap)
      );

      // Initialize return items from purchase items with remaining quantities
      const items: ReturnItem[] = purchase.items.map((item) => {
        const alreadyReturned = returnedQuantitiesMap.get(item.id!) || 0;
        const remaining = item.quantity - alreadyReturned;

        console.log(
          `Item ${item.productName}: original=${item.quantity}, returned=${alreadyReturned}, remaining=${remaining}`
        );

        return {
          purchaseItemId: item.id!,
          productId: item.productId,
          productName: item.productName,
          originalQuantity: item.quantity,
          alreadyReturnedQuantity: alreadyReturned,
          remainingQuantity: remaining,
          returnQuantity: 0, // User will fill this
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          taxAmount: 0,
          discountAmount: 0,
          total: 0,
        };
      });

      setReturnItems(items);
    } catch (err: any) {
      console.error("❌ Error in handlePurchaseSelection:", err);
      setError("Failed to load purchase details: " + err.message);
    }
  };

  const handleReturnQuantityChange = (index: number, value: number) => {
    const updatedItems = [...returnItems];
    const item = updatedItems[index];

    // Validate return quantity against REMAINING quantity (not original)
    if (value < 0) value = 0;
    if (value > item.remainingQuantity) value = item.remainingQuantity;

    item.returnQuantity = value;

    // Calculate amounts
    const baseAmount = item.unitPrice * value;
    const taxAmount = (baseAmount * item.taxRate) / 100;
    item.taxAmount = taxAmount;
    item.total = baseAmount + taxAmount - (item.discountAmount || 0);

    setReturnItems(updatedItems);
  };

  const calculateTotals = () => {
    const itemsToReturn = returnItems.filter((item) => item.returnQuantity > 0);

    const subtotal = itemsToReturn.reduce(
      (sum, item) => sum + item.unitPrice * item.returnQuantity,
      0
    );

    const totalTax = itemsToReturn.reduce(
      (sum, item) => sum + item.taxAmount,
      0
    );

    // Calculate GST breakdown based on state
    const isSameState = companyState === supplierState;
    const cgst = isSameState ? totalTax / 2 : 0;
    const sgst = isSameState ? totalTax / 2 : 0;
    const igst = !isSameState ? totalTax : 0;

    const grandTotal = subtotal + totalTax;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      cgst: Number(cgst.toFixed(2)),
      sgst: Number(sgst.toFixed(2)),
      igst: Number(igst.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!selectedPurchase) {
      setError("Please select a purchase invoice");
      return;
    }

    const itemsToReturn = returnItems.filter((item) => item.returnQuantity > 0);
    if (itemsToReturn.length === 0) {
      setError("Please select at least one item to return");
      return;
    }

    if (!returnReason) {
      setError("Please select a return reason");
      return;
    }

    if (!adjustmentType) {
      setError("Please select an adjustment type");
      return;
    }

    // Check refund details for refund adjustment types
    const refundAdjustmentTypes = [
      "CASH_REFUND",
      "BANK_REFUND",
      "WALLET",
      "AEPS",
    ];
    if (refundAdjustmentTypes.includes(adjustmentType) && !refundMethod) {
      setError("Please select a refund method");
      return;
    }

    setIsSubmitting(true);

    try {
      const totals = calculateTotals();

      // Build return items command
      const returnItemCommands: PurchaseReturnItemCommand[] = itemsToReturn.map(
        (item) => ({
          purchaseItemId: item.purchaseItemId,
          productId: item.productId,
          productName: item.productName,
          originalQuantity: item.originalQuantity,
          returnQuantity: item.returnQuantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          discountAmount: item.discountAmount || 0,
          total: item.total,
        })
      );

      // Build command
      const command: PurchaseReturnCommand = {
        originalPurchaseId: selectedPurchase.id,
        originalPurchaseNumber: selectedPurchase.purchaseNumber,
        supplierId: selectedPurchase.supplierId,
        supplierName: selectedPurchase.supplierName,
        returnDate,
        returnReason: returnReason as any,
        adjustmentType: adjustmentType as any,
        subtotal: totals.subtotal,
        totalTax: totals.totalTax,
        cgstAmount: totals.cgst,
        sgstAmount: totals.sgst,
        igstAmount: totals.igst,
        grandTotal: totals.grandTotal,
        refundMethod: refundAdjustmentTypes.includes(adjustmentType)
          ? (refundMethod as any)
          : undefined,
        refundAmount: refundAdjustmentTypes.includes(adjustmentType)
          ? totals.grandTotal
          : undefined,
        bankName: bankName || undefined,
        transactionId: transactionId || undefined,
        refundReferenceNo: refundReferenceNo || undefined,
        notes: notes || undefined,
        items: returnItemCommands,
      };

      await purchaseReturnApi.createPurchaseReturn(command);
      setSuccess("Purchase return created successfully!");

      // Reset form
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create purchase return");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedSupplierId(null);
    setSelectedPurchase(null);
    setReturnDate(new Date().toISOString().split("T")[0]);
    setReturnReason("DAMAGED");
    setAdjustmentType("ADJUST_IN_NEXT");
    setRefundMethod("CASH");
    setBankName("");
    setTransactionId("");
    setRefundReferenceNo("");
    setNotes("");
    setReturnItems([]);
    setError("");
    setSuccess("");
  };

  const totals = calculateTotals();
  const refundAdjustmentTypes = [
    "CASH_REFUND",
    "BANK_REFUND",
    "WALLET",
    "AEPS",
  ];
  const showRefundFields = refundAdjustmentTypes.includes(adjustmentType);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Purchase Return</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Return Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supplier Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier *</Label>
                  <Select
                    value={selectedSupplierId?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedSupplierId(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem
                          key={supplier.id}
                          value={supplier.id.toString()}
                        >
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Return Date *</Label>
                  <Input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Purchase Selection */}
              {selectedSupplierId && (
                <div>
                  <Label>Original Purchase Invoice *</Label>
                  {loadingPurchases ? (
                    <div className="flex items-center gap-2 p-3 border rounded-md">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading purchases...</span>
                    </div>
                  ) : supplierPurchases.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        No purchases found for this supplier
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Select
                      value={selectedPurchase?.id.toString() || ""}
                      onValueChange={(value) =>
                        handlePurchaseSelection(parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select purchase invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {supplierPurchases.map((purchase) => (
                          <SelectItem
                            key={purchase.id}
                            value={purchase.id.toString()}
                          >
                            {purchase.purchaseNumber} -{" "}
                            {new Date(
                              purchase.purchaseDate
                            ).toLocaleDateString()}{" "}
                            - ₹{purchase.grandTotal.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Return Reason & Adjustment Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Return Reason *</Label>
                  <Select value={returnReason} onValueChange={setReturnReason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAMAGED">Damaged Goods</SelectItem>
                      <SelectItem value="WRONG_ITEM">
                        Wrong Item Received
                      </SelectItem>
                      <SelectItem value="EXCESS">Excess Quantity</SelectItem>
                      <SelectItem value="EXPIRED">Expired Products</SelectItem>
                      <SelectItem value="QUALITY_ISSUE">
                        Quality Issue
                      </SelectItem>
                      <SelectItem value="OTHER">Other Reason</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Adjustment Type *</Label>
                  <Select
                    value={adjustmentType}
                    onValueChange={setAdjustmentType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADJUST_IN_NEXT">
                        Adjust in Next Purchase
                      </SelectItem>
                      <SelectItem value="CASH_REFUND">Cash Refund</SelectItem>
                      <SelectItem value="BANK_REFUND">
                        Bank Transfer Refund
                      </SelectItem>
                      <SelectItem value="WALLET">Wallet Refund</SelectItem>
                      <SelectItem value="AEPS">AEPS Refund</SelectItem>
                      <SelectItem value="NO_ADJUSTMENT">
                        No Adjustment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Refund Details (conditional) */}
              {showRefundFields && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <Label>Refund Method *</Label>
                    <Select
                      value={refundMethod}
                      onValueChange={setRefundMethod}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="BANK">Bank Transfer</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="WALLET">Wallet</SelectItem>
                        <SelectItem value="AEPS">AEPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Bank Name</Label>
                    <Input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <Label>Transaction ID</Label>
                    <Input
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Return Items Table */}
          {selectedPurchase && returnItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Items to Return</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Warning if all items fully returned */}
                {returnItems.every((item) => item.remainingQuantity === 0) && (
                  <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      All items from this purchase have already been returned.
                      No items available for return.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead className="text-right">
                          Original Qty
                        </TableHead>
                        <TableHead className="text-right">
                          Already Returned
                        </TableHead>
                        <TableHead className="text-right">Remaining</TableHead>
                        <TableHead className="text-right">Return Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Tax Rate</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returnItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.productName}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.originalQuantity}
                          </TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400">
                            {item.alreadyReturnedQuantity}
                          </TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold">
                            {item.remainingQuantity}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0"
                              max={item.remainingQuantity}
                              value={item.returnQuantity || ""}
                              onChange={(e) =>
                                handleReturnQuantityChange(
                                  index,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-20 text-right"
                              disabled={item.remainingQuantity === 0}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{item.unitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.taxRate}%
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{item.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals Summary */}
                <div className="mt-6 flex justify-end">
                  <div className="w-96 space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold">
                        ₹{totals.subtotal.toFixed(2)}
                      </span>
                    </div>
                    {totals.cgst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>CGST:</span>
                        <span>₹{totals.cgst.toFixed(2)}</span>
                      </div>
                    )}
                    {totals.sgst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>SGST:</span>
                        <span>₹{totals.sgst.toFixed(2)}</span>
                      </div>
                    )}
                    {totals.igst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>IGST:</span>
                        <span>₹{totals.igst.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                      <span className="font-bold text-lg">Grand Total:</span>
                      <span className="font-bold text-lg text-red-600 dark:text-red-400">
                        ₹{totals.grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardContent className="pt-6">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the return..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting || !selectedPurchase}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Return...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Purchase Return
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
