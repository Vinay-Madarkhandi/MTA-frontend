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
import receiptApi, {
  ReceiptEntryCommand,
  OutstandingInvoice,
  InvoiceAdjustmentCommand,
} from "@/lib/api/receipts";
import { useCustomers } from "@/hooks/useParties";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QRCodeSVG } from "qrcode.react";

export default function ReceiptsPage() {
  const { parties: partiesData, loading: partiesLoading } = useCustomers();
  const parties = partiesData || []; // Ensure parties is always an array

  // Form state
  const [receiptDate, setReceiptDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [receiptType, setReceiptType] = useState<
    "AGAINST_INVOICE" | "OUTSTANDING_RECOVERY" | "ADVANCE" | "OTHER_INCOME"
  >("AGAINST_INVOICE");
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
  const [partyName, setPartyName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountReceived, setAmountReceived] = useState("");
  const [bankName, setBankName] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [incomeHead, setIncomeHead] = useState("");
  const [narration, setNarration] = useState("");

  // Outstanding invoices state
  const [outstandingInvoices, setOutstandingInvoices] = useState<
    OutstandingInvoice[]
  >([]);
  const [selectedInvoices, setSelectedInvoices] = useState<
    InvoiceAdjustmentCommand[]
  >([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load outstanding invoices when party is selected and type is AGAINST_INVOICE
  useEffect(() => {
    if (selectedPartyId && receiptType === "AGAINST_INVOICE") {
      loadOutstandingInvoices(selectedPartyId);
    } else {
      setOutstandingInvoices([]);
      setSelectedInvoices([]);
    }
  }, [selectedPartyId, receiptType]);

  // Update party name when party is selected
  useEffect(() => {
    if (selectedPartyId && parties.length > 0) {
      const party = parties.find((p) => p.id === selectedPartyId);
      if (party) {
        setPartyName(party.name);
      }
    }
  }, [selectedPartyId, parties]);

  const loadOutstandingInvoices = async (partyId: number) => {
    setLoadingInvoices(true);
    try {
      const invoices = await receiptApi.getOutstandingInvoices(partyId);
      setOutstandingInvoices(invoices || []); // Ensure it's always an array
    } catch (err: any) {
      setError("Failed to load outstanding invoices");
      setOutstandingInvoices([]); // Reset to empty array on error
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleInvoiceSelection = (
    invoice: OutstandingInvoice,
    selected: boolean
  ) => {
    if (selected) {
      setSelectedInvoices([
        ...selectedInvoices,
        {
          saleId: invoice.saleId,
          invoiceNumber: invoice.invoiceNumber,
          invoiceAmount: invoice.invoiceAmount,
          adjustedAmount: invoice.balanceAmount, // Default to full balance
        },
      ]);
    } else {
      setSelectedInvoices(
        selectedInvoices.filter((inv) => inv.saleId !== invoice.saleId)
      );
    }
  };

  const updateAdjustedAmount = (saleId: number, amount: number) => {
    setSelectedInvoices(
      selectedInvoices.map((inv) =>
        inv.saleId === saleId ? { ...inv, adjustedAmount: amount } : inv
      )
    );
  };

  const getTotalAdjusted = () => {
    return selectedInvoices.reduce((sum, inv) => sum + inv.adjustedAmount, 0);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!receiptDate) {
      setError("Receipt date is required");
      return;
    }

    if (!partyName && receiptType !== "OTHER_INCOME") {
      setError("Party name is required");
      return;
    }

    if (!amountReceived || parseFloat(amountReceived) <= 0) {
      setError("Amount received must be greater than 0");
      return;
    }

    if (receiptType === "AGAINST_INVOICE" && selectedInvoices.length === 0) {
      setError("Please select at least one invoice to adjust");
      return;
    }

    // Validate adjusted amounts are greater than 0
    if (receiptType === "AGAINST_INVOICE") {
      const invalidAdjustments = selectedInvoices.filter(
        (inv) => inv.adjustedAmount <= 0
      );
      if (invalidAdjustments.length > 0) {
        setError(
          "All adjusted amounts must be greater than 0. Please enter valid amounts for selected invoices."
        );
        return;
      }
    }

    if (
      receiptType === "AGAINST_INVOICE" &&
      getTotalAdjusted() !== parseFloat(amountReceived)
    ) {
      setError("Total adjusted amount must equal amount received");
      return;
    }

    if (receiptType === "OTHER_INCOME" && !incomeHead) {
      setError("Income head is required for other income");
      return;
    }

    setSaving(true);

    try {
      const command: ReceiptEntryCommand = {
        receiptDate,
        receiptType,
        partyId: selectedPartyId || undefined,
        partyName,
        paymentMethod,
        amountReceived: parseFloat(amountReceived),
        bankName: bankName || undefined,
        chequeNumber: chequeNumber || undefined,
        chequeDate: chequeDate || undefined,
        transactionId: transactionId || undefined,
        incomeHead: incomeHead || undefined,
        narration: narration || undefined,
        invoiceAdjustments:
          receiptType === "AGAINST_INVOICE" ? selectedInvoices : undefined,
      };

      await receiptApi.createReceiptEntry(command);
      setSuccess("Receipt entry created successfully!");

      // Reset form
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create receipt entry");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setReceiptDate(new Date().toISOString().split("T")[0]);
    setReceiptType("AGAINST_INVOICE");
    setSelectedPartyId(null);
    setPartyName("");
    setPaymentMethod("CASH");
    setAmountReceived("");
    setBankName("");
    setChequeNumber("");
    setChequeDate("");
    setTransactionId("");
    setIncomeHead("");
    setNarration("");
    setSelectedInvoices([]);
    setOutstandingInvoices([]);
  };

  // Show loading state while parties are being fetched
  if (partiesLoading && !parties) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Receipt Entry
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Record customer receipts - Against Invoice, Outstanding Recovery,
            Advance, or Other Income
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <AlertDescription className="text-green-800 dark:text-green-200">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Receipt Date */}
            <div>
              <Label>Receipt Date *</Label>
              <Input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Receipt Type */}
            <div>
              <Label>Receipt Type *</Label>
              <Select
                value={receiptType}
                onValueChange={(value: any) => setReceiptType(value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGAINST_INVOICE">
                    Against Sales Invoice
                  </SelectItem>
                  <SelectItem value="OUTSTANDING_RECOVERY">
                    Outstanding Recovery
                  </SelectItem>
                  <SelectItem value="ADVANCE">Advance Receipt</SelectItem>
                  <SelectItem value="OTHER_INCOME">Other Income</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {receiptType === "AGAINST_INVOICE" &&
                  "Adjust specific invoices"}
                {receiptType === "OUTSTANDING_RECOVERY" &&
                  "Recover outstanding credit"}
                {receiptType === "ADVANCE" && "Customer pays in advance"}
                {receiptType === "OTHER_INCOME" &&
                  "Interest, Rent, Misc income"}
              </p>
            </div>

            {/* Customer Selection (not for OTHER_INCOME) */}
            {receiptType !== "OTHER_INCOME" && (
              <div>
                <Label>Customer *</Label>
                <Select
                  value={selectedPartyId?.toString() || ""}
                  onValueChange={(value) => setSelectedPartyId(parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {parties &&
                      Array.isArray(parties) &&
                      parties.map((party) => (
                        <SelectItem key={party.id} value={party.id.toString()}>
                          {party.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Party Name (for OTHER_INCOME) */}
            {receiptType === "OTHER_INCOME" && (
              <div>
                <Label>Party Name *</Label>
                <Input
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="Enter party name..."
                  className="mt-1"
                />
              </div>
            )}

            {/* Income Head (for OTHER_INCOME) */}
            {receiptType === "OTHER_INCOME" && (
              <div>
                <Label>Income Head *</Label>
                <Select value={incomeHead} onValueChange={setIncomeHead}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select income type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interest Income">
                      Interest Income
                    </SelectItem>
                    <SelectItem value="Rent Received">Rent Received</SelectItem>
                    <SelectItem value="Commission Received">
                      Commission Received
                    </SelectItem>
                    <SelectItem value="Discount Received">
                      Discount Received
                    </SelectItem>
                    <SelectItem value="Miscellaneous Income">
                      Miscellaneous Income
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <Label>Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-1">
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

            {/* Amount Received */}
            <div>
              <Label>Amount Received *</Label>
              <Input
                type="number"
                step="0.01"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="Enter amount..."
                className="mt-1"
              />
            </div>

            {/* Bank Details (for BANK/CHEQUE) */}
            {(paymentMethod === "BANK" || paymentMethod === "CHEQUE") && (
              <>
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name..."
                    className="mt-1"
                  />
                </div>

                {paymentMethod === "CHEQUE" && (
                  <>
                    <div>
                      <Label>Cheque Number</Label>
                      <Input
                        value={chequeNumber}
                        onChange={(e) => setChequeNumber(e.target.value)}
                        placeholder="Enter cheque number..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Cheque Date</Label>
                      <Input
                        type="date"
                        value={chequeDate}
                        onChange={(e) => setChequeDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Transaction ID (for UPI/AEPS/WALLET/BANK) */}
            {(paymentMethod === "UPI" ||
              paymentMethod === "AEPS" ||
              paymentMethod === "WALLET" ||
              paymentMethod === "BANK") && (
              <div>
                <Label>Transaction ID / Reference No.</Label>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID..."
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* UPI QR Code */}
          {paymentMethod === "UPI" && parseFloat(amountReceived) > 0 && (
            <div className="mt-6 flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-3">
                Scan QR Code to Pay
              </Label>
              <div className="bg-white p-3 rounded-lg">
                <QRCodeSVG
                  value={`upi://pay?pa=8856094992@jupiteraxis&pn=MTA&am=${
                    parseFloat(amountReceived) || 0
                  }&cu=INR`}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Amount: ₹{parseFloat(amountReceived).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                8856094992@jupiteraxis
              </p>
            </div>
          )}

          {/* Outstanding Invoices (for AGAINST_INVOICE) */}
          {receiptType === "AGAINST_INVOICE" && selectedPartyId && (
            <div className="mt-6">
              <Label className="text-lg font-semibold">
                Select Invoices to Adjust
              </Label>
              {loadingInvoices ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : !outstandingInvoices || outstandingInvoices.length === 0 ? (
                <Alert className="mt-4">
                  <AlertDescription>
                    No outstanding invoices found for this customer.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="mt-4 space-y-3">
                  {outstandingInvoices.map((invoice) => {
                    const isSelected = selectedInvoices.some(
                      (inv) => inv.saleId === invoice.saleId
                    );
                    const selectedInv = selectedInvoices.find(
                      (inv) => inv.saleId === invoice.saleId
                    );

                    return (
                      <Card
                        key={invoice.saleId}
                        className={`p-4 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              handleInvoiceSelection(invoice, e.target.checked)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {invoice.invoiceNumber}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Date:{" "}
                                  {new Date(
                                    invoice.invoiceDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Invoice: ₹{invoice.invoiceAmount.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Paid: ₹{invoice.paidAmount.toFixed(2)}
                                </p>
                                <p className="font-semibold text-red-600 dark:text-red-400">
                                  Balance: ₹{invoice.balanceAmount.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="mt-3">
                                <Label className="text-sm">Adjust Amount</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={selectedInv?.adjustedAmount || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || value === "0") {
                                      updateAdjustedAmount(invoice.saleId, 0);
                                    } else {
                                      const parsed = parseFloat(value);
                                      if (!isNaN(parsed) && parsed > 0) {
                                        updateAdjustedAmount(
                                          invoice.saleId,
                                          parsed
                                        );
                                      }
                                    }
                                  }}
                                  max={invoice.balanceAmount}
                                  placeholder={`Max: ${invoice.balanceAmount.toFixed(
                                    2
                                  )}`}
                                  className="mt-1"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}

                  {selectedInvoices.length > 0 && (
                    <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Total Adjusted:
                        </span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          ₹{getTotalAdjusted().toFixed(2)}
                        </span>
                      </div>
                      {parseFloat(amountReceived) > 0 &&
                        getTotalAdjusted() !== parseFloat(amountReceived) && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                            Total adjusted must equal amount received (₹
                            {parseFloat(amountReceived).toFixed(2)})
                          </p>
                        )}
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Narration */}
          <div className="mt-6">
            <Label>Narration (Optional)</Label>
            <Textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Add notes about this receipt..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Receipt Entry
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={saving}>
              Reset
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
