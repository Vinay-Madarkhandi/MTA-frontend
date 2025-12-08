"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, Check } from "lucide-react";
import paymentApi, {
  PaymentEntryCommand,
  OutstandingPurchase,
  InvoiceAdjustmentCommand,
} from "@/lib/api/payments";
import { useSuppliers } from "@/hooks/useParties";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QRCodeSVG } from "qrcode.react";

export default function PaymentsPage() {
  const { parties: partiesData, loading: partiesLoading } = useSuppliers();
  const parties = partiesData || []; // Ensure parties is always an array

  // Form state
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentType, setPaymentType] = useState<
    | "AGAINST_INVOICE"
    | "OUTSTANDING_SETTLEMENT"
    | "ADVANCE_PAYMENT"
    | "OTHER_EXPENSE"
  >("AGAINST_INVOICE");
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
  const [partyName, setPartyName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState("");
  const [bankName, setBankName] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [expenseHead, setExpenseHead] = useState("");
  const [narration, setNarration] = useState("");

  // Outstanding purchases state
  const [outstandingPurchases, setOutstandingPurchases] = useState<
    OutstandingPurchase[]
  >([]);
  const [selectedPurchases, setSelectedPurchases] = useState<
    InvoiceAdjustmentCommand[]
  >([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load outstanding purchases when party is selected and type is AGAINST_INVOICE
  useEffect(() => {
    if (selectedPartyId && paymentType === "AGAINST_INVOICE") {
      loadOutstandingPurchases(selectedPartyId);
    } else {
      setOutstandingPurchases([]);
      setSelectedPurchases([]);
    }
  }, [selectedPartyId, paymentType]);

  // Update party name when party is selected
  useEffect(() => {
    if (selectedPartyId && parties.length > 0) {
      const party = parties.find((p) => p.id === selectedPartyId);
      if (party) {
        setPartyName(party.name);
      }
    }
  }, [selectedPartyId, parties]);

  const loadOutstandingPurchases = async (partyId: number) => {
    setLoadingPurchases(true);
    try {
      const purchases = await paymentApi.getOutstandingPurchases(partyId);
      setOutstandingPurchases(purchases || []); // Ensure it's always an array
    } catch (err: any) {
      setError("Failed to load outstanding purchases");
      setOutstandingPurchases([]); // Reset to empty array on error
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleInvoiceSelection = (purchase: OutstandingPurchase) => {
    const existing = selectedPurchases.find(
      (inv) => inv.purchaseId === purchase.purchaseId
    );

    if (existing) {
      // Remove if already selected
      setSelectedPurchases(
        selectedPurchases.filter(
          (inv) => inv.purchaseId !== purchase.purchaseId
        )
      );
    } else {
      // Add with full balance amount
      setSelectedPurchases([
        ...selectedPurchases,
        {
          purchaseId: purchase.purchaseId,
          invoiceNumber: purchase.invoiceNumber,
          invoiceAmount: purchase.invoiceAmount,
          adjustedAmount: purchase.balanceAmount,
        },
      ]);
    }
  };

  const handleAdjustedAmountChange = (
    purchaseId: number,
    newAmount: number
  ) => {
    setSelectedPurchases(
      selectedPurchases.map((inv) =>
        inv.purchaseId === purchaseId
          ? { ...inv, adjustedAmount: newAmount }
          : inv
      )
    );
  };

  const calculateTotalAdjusted = () => {
    return selectedPurchases.reduce(
      (sum, inv) => sum + (inv.adjustedAmount || 0),
      0
    );
  };

  const resetForm = () => {
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentType("AGAINST_INVOICE");
    setSelectedPartyId(null);
    setPartyName("");
    setPaymentMethod("CASH");
    setAmountPaid("");
    setBankName("");
    setChequeNumber("");
    setChequeDate("");
    setTransactionId("");
    setExpenseHead("");
    setNarration("");
    setSelectedPurchases([]);
    setOutstandingPurchases([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!paymentDate) {
      setError("Payment date is required");
      return;
    }

    if (paymentType !== "OTHER_EXPENSE" && !selectedPartyId) {
      setError("Please select a supplier");
      return;
    }

    if (!paymentMethod) {
      setError("Payment method is required");
      return;
    }

    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      setError("Amount paid must be greater than 0");
      return;
    }

    if (paymentType === "AGAINST_INVOICE" && selectedPurchases.length === 0) {
      setError("Please select at least one purchase invoice");
      return;
    }

    if (paymentType === "OTHER_EXPENSE" && !expenseHead) {
      setError("Expense head is required for other expenses");
      return;
    }

    // Validate total adjusted amount matches amount paid for AGAINST_INVOICE
    if (paymentType === "AGAINST_INVOICE") {
      const totalAdjusted = calculateTotalAdjusted();
      if (Math.abs(totalAdjusted - parseFloat(amountPaid)) > 0.01) {
        setError(
          `Total adjusted amount (₹${totalAdjusted.toFixed(
            2
          )}) must match amount paid (₹${parseFloat(amountPaid).toFixed(2)})`
        );
        return;
      }
    }

    setSaving(true);

    try {
      const command: PaymentEntryCommand = {
        paymentDate,
        paymentType,
        partyId: paymentType === "OTHER_EXPENSE" ? undefined : selectedPartyId!,
        partyName: paymentType === "OTHER_EXPENSE" ? "N/A" : partyName,
        paymentMethod,
        amountPaid: parseFloat(amountPaid),
        bankName: bankName || undefined,
        chequeNumber: chequeNumber || undefined,
        chequeDate: chequeDate || undefined,
        transactionId: transactionId || undefined,
        expenseHead: paymentType === "OTHER_EXPENSE" ? expenseHead : undefined,
        narration: narration || undefined,
        invoiceAdjustments:
          paymentType === "AGAINST_INVOICE" ? selectedPurchases : undefined,
      };

      await paymentApi.createPayment(command);
      setSuccess("Payment entry created successfully!");
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to create payment entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Payment Entries</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Date and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Date *</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Payment Type *</Label>
                <Select
                  value={paymentType}
                  onValueChange={(value: any) => setPaymentType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGAINST_INVOICE">
                      Against Invoice
                    </SelectItem>
                    <SelectItem value="OUTSTANDING_SETTLEMENT">
                      Outstanding Settlement
                    </SelectItem>
                    <SelectItem value="ADVANCE_PAYMENT">
                      Advance Payment
                    </SelectItem>
                    <SelectItem value="OTHER_EXPENSE">Other Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Supplier Selection (not for OTHER_EXPENSE) */}
            {paymentType !== "OTHER_EXPENSE" && (
              <div>
                <Label>Supplier *</Label>
                <Select
                  value={selectedPartyId?.toString() || ""}
                  onValueChange={(value) => setSelectedPartyId(parseInt(value))}
                  disabled={partiesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {parties.map((party) => (
                      <SelectItem key={party.id} value={party.id.toString()}>
                        {party.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Expense Head (only for OTHER_EXPENSE) */}
            {paymentType === "OTHER_EXPENSE" && (
              <div>
                <Label>Expense Head *</Label>
                <Input
                  value={expenseHead}
                  onChange={(e) => setExpenseHead(e.target.value)}
                  placeholder="e.g., Rent, Utilities, Salaries"
                  required
                />
              </div>
            )}

            {/* Outstanding Purchases Selection (only for AGAINST_INVOICE) */}
            {paymentType === "AGAINST_INVOICE" &&
              selectedPartyId &&
              !loadingPurchases && (
                <div>
                  <Label className="text-base font-semibold">
                    Outstanding Purchases
                  </Label>
                  {outstandingPurchases.length === 0 ? (
                    <Alert className="mt-2">
                      <AlertDescription>
                        No outstanding purchases found for this supplier.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="mt-2 border rounded-lg border-gray-200 dark:border-gray-700">
                      <div className="max-h-64 overflow-y-auto">
                        {outstandingPurchases.map((purchase) => {
                          const isSelected = selectedPurchases.some(
                            (inv) => inv.purchaseId === purchase.purchaseId
                          );
                          const selectedInv = selectedPurchases.find(
                            (inv) => inv.purchaseId === purchase.purchaseId
                          );

                          return (
                            <div
                              key={purchase.purchaseId}
                              className={`p-3 border-b last:border-b-0 border-gray-200 dark:border-gray-700 ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    handleInvoiceSelection(purchase)
                                  }
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {purchase.invoiceNumber}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(
                                          purchase.invoiceDate
                                        ).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm text-gray-900 dark:text-gray-100">
                                        Total: ₹
                                        {purchase.invoiceAmount.toFixed(2)}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Paid: ₹{purchase.paidAmount.toFixed(2)}
                                      </div>
                                      <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                                        Balance: ₹
                                        {purchase.balanceAmount.toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="mt-2">
                                      <Label className="text-xs">
                                        Adjusted Amount
                                      </Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={
                                          selectedInv?.adjustedAmount || ""
                                        }
                                        onChange={(e) =>
                                          handleAdjustedAmountChange(
                                            purchase.purchaseId,
                                            parseFloat(e.target.value)
                                          )
                                        }
                                        max={purchase.balanceAmount}
                                        className="w-full"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {selectedPurchases.length > 0 && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700">
                          Total Adjusted: ₹{calculateTotalAdjusted().toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            {loadingPurchases && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading outstanding purchases...</span>
              </div>
            )}

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="AEPS">AEPS</SelectItem>
                    <SelectItem value="WALLET">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount Paid *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Bank Details (optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bank Name</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>Transaction ID / Reference</Label>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Cheque Details (optional) */}
            {paymentMethod === "CHEQUE" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cheque Number</Label>
                  <Input
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label>Cheque Date</Label>
                  <Input
                    type="date"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Narration */}
            <div>
              <Label>Narration</Label>
              <Textarea
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Additional notes (optional)"
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create Payment Entry
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={saving}
              >
                Reset
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
