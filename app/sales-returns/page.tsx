"use client";

/**
 * Sales Return Page
 * Complete UI for creating sales returns with refund processing and stock management
 */

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useCustomers } from "@/hooks/useParties";
import { salesApi } from "@/lib/api/sales";
import { SaleTransaction } from "@/types";
import salesReturnApi, {
  SalesReturn,
  SalesReturnItem,
  SalesReturnCommand,
  SalesReturnItemCommand,
} from "@/lib/api/sales-returns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RotateCcw } from "lucide-react";
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
  saleItemId: number;
  productId: number;
  productName: string;
  sku?: string;
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

export default function SalesReturnPage() {
  // ==================== DATA FETCHING ====================
  const { parties: customers } = useCustomers();

  // ==================== STATE ====================
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const [customerSales, setCustomerSales] = useState<SaleTransaction[]>([]);
  const [selectedSale, setSelectedSale] = useState<SaleTransaction | null>(
    null
  );
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [returnReason, setReturnReason] = useState<string>("DEFECTIVE");
  const [stockAction, setStockAction] = useState<string>("RESALABLE");
  const [refundMode, setRefundMode] = useState<string>("CASH");

  // Bank/Payment Details
  const [bankName, setBankName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [upiReference, setUpiReference] = useState("");
  const [cardLast4, setCardLast4] = useState("");

  // AEPS Details
  const [aepsTransactionId, setAepsTransactionId] = useState("");
  const [aepsBankName, setAepsBankName] = useState("");
  const [aepsBankRrn, setAepsBankRrn] = useState("");
  const [aepsAadhaarMasked, setAepsAadhaarMasked] = useState("");

  // Credit Note
  const [creditNoteAmount, setCreditNoteAmount] = useState("");
  const [creditNoteExpiryDate, setCreditNoteExpiryDate] = useState("");

  const [notes, setNotes] = useState("");
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);

  // UI State
  const [loadingSales, setLoadingSales] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [companyState] = useState("Karnataka");
  const [customerState, setCustomerState] = useState("Karnataka");

  // ==================== EFFECTS ====================

  // Load sales when customer is selected
  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomerSales(selectedCustomerId);
    } else {
      setCustomerSales([]);
      setSelectedSale(null);
      setReturnItems([]);
    }
  }, [selectedCustomerId]);

  // ==================== FUNCTIONS ====================

  const loadCustomerSales = async (customerId: number) => {
    setLoadingSales(true);
    setError("");
    try {
      const allSales = await salesApi.getAllSales();
      const filteredSales = allSales.filter(
        (sale) => sale.partyId === customerId
      );
      setCustomerSales(filteredSales || []);
    } catch (err: any) {
      setError("Failed to load customer sales");
      setCustomerSales([]);
    } finally {
      setLoadingSales(false);
    }
  };

  const handleSaleSelection = async (saleId: number) => {
    try {
      const sale = await salesApi.getSaleById(saleId);
      setSelectedSale(sale);

      // Fetch already returned quantities for this sale
      let existingReturns: SalesReturn[] = [];
      try {
        existingReturns = await salesReturnApi.getSalesReturnsBySaleId(saleId);
        console.log("🔍 Existing returns for sale:", existingReturns);
      } catch (returnErr: any) {
        console.error("❌ Error fetching existing returns:", returnErr);
        existingReturns = [];
      }

      // Calculate already returned quantities per item
      const returnedQuantitiesMap = new Map<number, number>();
      existingReturns.forEach((returnRecord) => {
        returnRecord.items?.forEach((returnItem: SalesReturnItem) => {
          const currentReturned =
            returnedQuantitiesMap.get(returnItem.saleItemId) || 0;
          returnedQuantitiesMap.set(
            returnItem.saleItemId,
            currentReturned + returnItem.returnQuantity
          );
        });
      });

      console.log(
        "📊 Returned quantities map:",
        Object.fromEntries(returnedQuantitiesMap)
      );

      // Initialize return items from sale items with remaining quantities
      const items: ReturnItem[] = sale.items.map((item) => {
        const alreadyReturned = returnedQuantitiesMap.get(item.id!) || 0;
        const remaining = item.quantity - alreadyReturned;

        console.log(
          `Item ${item.productName}: original=${item.quantity}, returned=${alreadyReturned}, remaining=${remaining}`
        );

        return {
          saleItemId: item.id!,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          originalQuantity: item.quantity,
          alreadyReturnedQuantity: alreadyReturned,
          remainingQuantity: remaining,
          returnQuantity: 0,
          unitPrice: item.rate,
          taxRate: 0, // Calculate from sale if needed
          taxAmount: 0,
          discountAmount: 0,
          total: 0,
        };
      });

      setReturnItems(items);
    } catch (err: any) {
      console.error("❌ Error in handleSaleSelection:", err);
      setError("Failed to load sale details: " + err.message);
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

    // Determine CGST/SGST vs IGST based on state
    const isSameState = companyState === customerState;
    const cgst = isSameState ? totalTax / 2 : 0;
    const sgst = isSameState ? totalTax / 2 : 0;
    const igst = isSameState ? 0 : totalTax;

    const grandTotal = subtotal + totalTax;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      cgst: parseFloat(cgst.toFixed(2)),
      sgst: parseFloat(sgst.toFixed(2)),
      igst: parseFloat(igst.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!selectedSale) {
      setError("Please select a sale invoice");
      return;
    }

    const itemsToReturn = returnItems.filter((item) => item.returnQuantity > 0);
    if (itemsToReturn.length === 0) {
      setError("Please specify at least one item to return");
      return;
    }

    if (!returnReason || !stockAction || !refundMode) {
      setError("Please fill all required fields");
      return;
    }

    // Validate refund mode specific fields
    if (refundMode === "BANK" && !bankName) {
      setError("Please enter bank name for bank refund");
      return;
    }

    if (refundMode === "UPI" && !upiReference) {
      setError("Please enter UPI reference for UPI refund");
      return;
    }

    if (refundMode === "AEPS" && (!aepsTransactionId || !aepsBankName)) {
      setError("Please enter AEPS transaction details");
      return;
    }

    if (refundMode === "CREDIT_NOTE" && !creditNoteAmount) {
      setError("Please enter credit note amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const command: SalesReturnCommand = {
        originalSaleId: selectedSale.id!,
        originalVoucherNo: selectedSale.voucherNo,
        customerId: selectedSale.partyId,
        customerName: selectedSale.partyName,
        customerPhone: selectedSale.partyPhone,
        returnDate,
        returnReason: returnReason as any,
        stockAction: stockAction as any,
        refundMode: refundMode as any,
        refundAmount: totals.grandTotal,
        subtotal: totals.subtotal,
        totalTax: totals.totalTax,
        cgstAmount: totals.cgst,
        sgstAmount: totals.sgst,
        igstAmount: totals.igst,
        grandTotal: totals.grandTotal,
        bankName: bankName || undefined,
        transactionId: transactionId || undefined,
        upiReference: upiReference || undefined,
        cardLast4: cardLast4 || undefined,
        aepsTransactionId: aepsTransactionId || undefined,
        aepsBankName: aepsBankName || undefined,
        aepsBankRrn: aepsBankRrn || undefined,
        aepsAadhaarMasked: aepsAadhaarMasked || undefined,
        creditNoteAmount: creditNoteAmount
          ? parseFloat(creditNoteAmount)
          : undefined,
        creditNoteExpiryDate: creditNoteExpiryDate || undefined,
        notes: notes || undefined,
        items: itemsToReturn.map((item) => ({
          saleItemId: item.saleItemId,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          originalQuantity: item.originalQuantity,
          returnQuantity: item.returnQuantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          discountAmount: item.discountAmount || 0,
          total: item.total,
        })),
      };

      await salesReturnApi.createSalesReturn(command);
      setSuccess("Sales return created successfully!");

      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create sales return"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomerId(null);
    setCustomerSales([]);
    setSelectedSale(null);
    setReturnDate(new Date().toISOString().split("T")[0]);
    setReturnReason("DEFECTIVE");
    setStockAction("RESALABLE");
    setRefundMode("CASH");
    setBankName("");
    setTransactionId("");
    setUpiReference("");
    setCardLast4("");
    setAepsTransactionId("");
    setAepsBankName("");
    setAepsBankRrn("");
    setAepsAadhaarMasked("");
    setCreditNoteAmount("");
    setCreditNoteExpiryDate("");
    setNotes("");
    setReturnItems([]);
    setError("");
    setSuccess("");
  };

  // Show refund mode specific fields
  const showBankFields = refundMode === "BANK";
  const showUpiFields = refundMode === "UPI";
  const showCardFields = refundMode === "CARD";
  const showAepsFields = refundMode === "AEPS";
  const showCreditNoteFields = refundMode === "CREDIT_NOTE";

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-3">
          <RotateCcw className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Sales Return</h1>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Return Details Form */}
        <Card>
          <CardHeader>
            <CardTitle>Return Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Customer Selection */}
              <div>
                <Label>Customer *</Label>
                <Select
                  value={selectedCustomerId?.toString() || ""}
                  onValueChange={(value) =>
                    setSelectedCustomerId(parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem
                        key={customer.id}
                        value={customer.id!.toString()}
                      >
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Return Date */}
              <div>
                <Label>Return Date *</Label>
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>

            {/* Sale Invoice Selection */}
            {selectedCustomerId && (
              <div>
                <Label>Original Sale Invoice *</Label>
                {loadingSales ? (
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading sales...</span>
                  </div>
                ) : (
                  <Select
                    value={selectedSale?.id?.toString() || ""}
                    onValueChange={(value) =>
                      handleSaleSelection(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sale invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerSales.map((sale) => (
                        <SelectItem key={sale.id} value={sale.id!.toString()}>
                          {sale.voucherNo} -{" "}
                          {new Date(sale.saleDate).toLocaleDateString()} - ₹
                          {sale.grandTotal.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Return Reason, Stock Action, Refund Mode */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Return Reason *</Label>
                <Select value={returnReason} onValueChange={setReturnReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEFECTIVE">Defective Product</SelectItem>
                    <SelectItem value="WRONG_PRODUCT">Wrong Product</SelectItem>
                    <SelectItem value="DAMAGED">Damaged in Transit</SelectItem>
                    <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
                    <SelectItem value="CUSTOMER_DISSATISFACTION">
                      Customer Dissatisfaction
                    </SelectItem>
                    <SelectItem value="EXPIRED">Expired Product</SelectItem>
                    <SelectItem value="OTHER">Other Reason</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Stock Action *</Label>
                <Select value={stockAction} onValueChange={setStockAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESALABLE">
                      Add Back to Stock (Resalable)
                    </SelectItem>
                    <SelectItem value="DAMAGED">
                      Mark as Damaged (Don't add to stock)
                    </SelectItem>
                    <SelectItem value="EXPIRED">
                      Mark as Expired (Don't add to stock)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Refund Mode *</Label>
                <Select value={refundMode} onValueChange={setRefundMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash Refund</SelectItem>
                    <SelectItem value="UPI">UPI Refund</SelectItem>
                    <SelectItem value="BANK">Bank Transfer</SelectItem>
                    <SelectItem value="WALLET">Wallet Credit</SelectItem>
                    <SelectItem value="CARD">Card Refund</SelectItem>
                    <SelectItem value="AEPS">AEPS Refund</SelectItem>
                    <SelectItem value="CREDIT_NOTE">Credit Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Conditional Refund Details */}
            {showBankFields && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <Label>Bank Name *</Label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
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

            {showUpiFields && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Label>UPI Reference *</Label>
                <Input
                  value={upiReference}
                  onChange={(e) => setUpiReference(e.target.value)}
                  placeholder="Enter UPI transaction reference"
                />
              </div>
            )}

            {showCardFields && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Label>Card Last 4 Digits</Label>
                <Input
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value.slice(0, 4))}
                  placeholder="Last 4 digits"
                  maxLength={4}
                />
              </div>
            )}

            {showAepsFields && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div>
                  <Label>AEPS Transaction ID *</Label>
                  <Input
                    value={aepsTransactionId}
                    onChange={(e) => setAepsTransactionId(e.target.value)}
                    placeholder="Enter AEPS transaction ID"
                  />
                </div>
                <div>
                  <Label>AEPS Bank Name *</Label>
                  <Input
                    value={aepsBankName}
                    onChange={(e) => setAepsBankName(e.target.value)}
                    placeholder="Enter bank name"
                  />
                </div>
                <div>
                  <Label>Bank RRN</Label>
                  <Input
                    value={aepsBankRrn}
                    onChange={(e) => setAepsBankRrn(e.target.value)}
                    placeholder="Retrieval Reference Number"
                  />
                </div>
                <div>
                  <Label>Aadhaar Last 4 Digits</Label>
                  <Input
                    value={aepsAadhaarMasked}
                    onChange={(e) =>
                      setAepsAadhaarMasked(e.target.value.slice(0, 4))
                    }
                    placeholder="Last 4 digits only"
                    maxLength={4}
                  />
                </div>
              </div>
            )}

            {showCreditNoteFields && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div>
                  <Label>Credit Note Amount *</Label>
                  <Input
                    type="number"
                    value={creditNoteAmount}
                    onChange={(e) => setCreditNoteAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label>Credit Note Expiry Date</Label>
                  <Input
                    type="date"
                    value={creditNoteExpiryDate}
                    onChange={(e) => setCreditNoteExpiryDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Return Items Table */}
        {selectedSale && returnItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Items to Return</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Warning if all items fully returned */}
              {returnItems.every((item) => item.remainingQuantity === 0) && (
                <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    All items from this sale have already been returned. No
                    items available for return.
                  </AlertDescription>
                </Alert>
              )}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="text-right">Original Qty</TableHead>
                      <TableHead className="text-right">
                        Already Returned
                      </TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead className="text-right">Return Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
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
                  <div className="flex justify-between pt-2 border-t text-lg font-bold">
                    <span>Grand Total:</span>
                    <span className="text-red-600">
                      ₹{totals.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {selectedSale && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the return..."
                rows={3}
              />
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {selectedSale && (
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Return...
                </>
              ) : (
                "Create Sales Return"
              )}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
