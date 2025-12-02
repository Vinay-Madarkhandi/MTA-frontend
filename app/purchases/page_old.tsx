"use client";

/**
 * Purchase Entry Page
 * Simple, clean purchase invoice entry form
 * Matches the design reference image
 */

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useProducts } from "@/hooks/useProducts";
import { useParties } from "@/hooks/useParties";
import { purchaseApi, PurchaseCommand } from "@/lib/api/purchases";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  rate: number;
  cgst: number;
  sgst: number;
  igst: number;
  amount: number;
}

export default function PurchaseEntryPage() {
  // ==================== DATA FETCHING ====================
  const { products, loading: productsLoading, error: productsError, fetchProducts } = useProducts();
  const { parties, createParty, loading: partiesLoading, error: partiesError } = useParties('SUPPLIER');

  // ==================== STATE ====================
  const [partyName, setPartyName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [narration, setNarration] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([
    {
      id: "1",
      productId: "",
      productName: "",
      qty: 0,
      rate: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      amount: 0,
    },
  ]);
  const [showAddParty, setShowAddParty] = useState(false);
  const [partySearchQuery, setPartySearchQuery] = useState("");
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [productSearchQueries, setProductSearchQueries] = useState<{ [key: string]: string }>({});
  const [showProductDropdowns, setShowProductDropdowns] = useState<{ [key: string]: boolean }>({});
  const [selectedPartyState, setSelectedPartyState] = useState("Karnataka");
  const [companyState] = useState("Karnataka");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== NEW PARTY FORM ====================
  const [newParty, setNewParty] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
  });

  // ==================== CALCULATIONS ====================
  const calculateItemAmount = (item: PurchaseItem): number => {
    const baseAmount = item.qty * item.rate;
    const cgstAmount = (baseAmount * item.cgst) / 100;
    const sgstAmount = (baseAmount * item.sgst) / 100;
    const igstAmount = (baseAmount * item.igst) / 100;
    return baseAmount + cgstAmount + sgstAmount + igstAmount;
  };

  const totalAmount = items.reduce((sum, item) => sum + calculateItemAmount(item), 0);

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Update item amounts when quantities, rates, or taxes change
    setItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        amount: calculateItemAmount(item),
      }))
    );
  }, []);

  // ==================== HANDLERS ====================

  const handlePartySelect = (partyName: string, partyState: string) => {
    setPartyName(partyName);
    setSelectedPartyState(partyState);
    setShowPartyDropdown(false);
    setPartySearchQuery(partyName);
  };

  const handleAddParty = async () => {
    if (!newParty.name.trim()) {
      alert("Please enter party name");
      return;
    }

    try {
      const addedParty = await createParty({
        name: newParty.name,
        phone: newParty.phone,
        email: newParty.email,
        address: newParty.address,
        gstin: newParty.gstin,
        partyType: 'SUPPLIER',
      });

      if (addedParty) {
        setPartyName(addedParty.name);
        setPartySearchQuery(addedParty.name);
        setNewParty({ name: "", phone: "", email: "", address: "", gstin: "" });
        setShowAddParty(false);
      }
    } catch (error) {
      console.error('Failed to add party:', error);
      alert('Failed to add party. Please try again.');
    }
  };

  const handleProductSelect = (itemId: string, productId: string, productName: string) => {
    const product = products.find((p) => p.id.toString() === productId);
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const updated = {
            ...item,
            productId,
            productName,
            rate: product?.purchasePrice || 0,
            cgst: selectedPartyState === companyState ? 9 : 0,
            sgst: selectedPartyState === companyState ? 9 : 0,
            igst: selectedPartyState !== companyState ? 18 : 0,
          };
          // Recalculate amount after updating taxes and rate
          return { ...updated, amount: calculateItemAmount(updated) };
        }
        return item;
      })
    );
    setShowProductDropdowns({ ...showProductDropdowns, [itemId]: false });
    setProductSearchQueries({ ...productSearchQueries, [itemId]: productName });
  };

  const handleItemUpdate = (itemId: string, field: keyof PurchaseItem, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          return { ...updated, amount: calculateItemAmount(updated) };
        }
        return item;
      })
    );
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `${Date.now()}`,
        productId: "",
        productName: "",
        qty: 0,
        rate: 0,
        cgst: selectedPartyState === companyState ? 9 : 0,
        sgst: selectedPartyState === companyState ? 9 : 0,
        igst: selectedPartyState !== companyState ? 18 : 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (itemId: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== itemId));
    }
  };

  const handleSavePurchase = async () => {
    // Validation
    if (!partyName.trim()) {
      alert("Please select a party");
      return;
    }

    const validItems = items.filter((item) => item.productName && item.qty > 0);
    if (validItems.length === 0) {
      alert("Please add at least one item with quantity");
      return;
    }

    const supplier = parties.find((p) => p.name === partyName);
    if (!supplier) {
      alert("Supplier not found. Please select a valid party.");
      return;
    }

    setIsSubmitting(true);

    try {
      const purchaseCommand: PurchaseCommand = {
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierContact: supplier.phone || '',
        supplierEmail: supplier.email || '',
        supplierGst: supplier.gstin || '',
        supplierAddress: supplier.address || '',
        purchaseDate: new Date().toISOString().split("T")[0],
        subtotal: validItems.reduce((sum, item) => sum + item.qty * item.rate, 0),
        totalTax: validItems.reduce((sum, item) => {
          const baseAmount = item.qty * item.rate;
          return sum + (baseAmount * item.cgst) / 100 + (baseAmount * item.sgst) / 100 + (baseAmount * item.igst) / 100;
        }, 0),
        totalDiscount: 0,
        shippingCharges: 0,
        otherCharges: 0,
        grandTotal: totalAmount,
        paymentStatus: 'pending',
        notes: narration,
        items: validItems.map((item) => ({
          productId: parseInt(item.productId),
          productName: item.productName,
          quantity: item.qty,
          unitPrice: item.rate,
          taxRate: item.cgst + item.sgst + item.igst,
          taxAmount: (item.qty * item.rate * (item.cgst + item.sgst + item.igst)) / 100,
          discountPercent: 0,
          discountAmount: 0,
          total: item.amount,
        })),
      };

      const result = await purchaseApi.createPurchase(purchaseCommand);
      
      alert(`✅ Purchase saved successfully!\nInvoice Number: ${result.purchaseNumber || invoiceNumber}`);
      
      // Reset form
      setPartyName("");
      setInvoiceNumber("");
      setNarration("");
      setItems([
        {
          id: "1",
          productId: "",
          productName: "",
          qty: 0,
          rate: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          amount: 0,
        },
      ]);
      setPartySearchQuery("");
      setProductSearchQueries({});

      // Refresh products to get updated stock
      await fetchProducts();
    } catch (error: any) {
      console.error("Failed to save purchase:", error);
      alert(`❌ Failed to save purchase: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Save to localStorage for now
    const draft = {
      partyName,
      invoiceNumber,
      narration,
      items,
    };
    localStorage.setItem('purchaseDraft', JSON.stringify(draft));
    alert("Draft saved!");
  };

  // ==================== FILTERED DATA ====================
  const filteredParties = parties.filter(
    (party) =>
      party.name.toLowerCase().includes(partySearchQuery.toLowerCase()) ||
      party.phone?.toLowerCase().includes(partySearchQuery.toLowerCase())
  );

  const getFilteredProducts = (itemId: string) => {
    const query = productSearchQueries[itemId] || "";
    return products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.sku.toLowerCase().includes(query.toLowerCase())
    );
  };

  // ==================== LOADING & ERROR STATES ====================

  if (productsLoading || partiesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </Layout>
    );
  }

  if (productsError || partiesError) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertDescription>
            Error loading data: {(productsError || partiesError)?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
      </Layout>
    );
  }

  // ==================== RENDER ====================

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Purchase Entry</h1>
          <p className="text-muted-foreground">Add new purchase invoice</p>
        </div>

        {/* Main Form Card */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Party Information */}
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Party Name</Label>
                  <div className="relative mt-1">
                    <Input
                      value={partySearchQuery}
                      onChange={(e) => {
                        setPartySearchQuery(e.target.value);
                        setShowPartyDropdown(true);
                      }}
                      onFocus={() => setShowPartyDropdown(true)}
                      onBlur={() => setTimeout(() => setShowPartyDropdown(false), 200)}
                      placeholder="Search party..."
                      className="w-full"
                    />
                    {showPartyDropdown && filteredParties.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto z-50">
                        {filteredParties.map((party) => (
                          <div
                            key={party.id}
                            className="px-3 py-2 hover:bg-accent cursor-pointer"
                            onClick={() => handlePartySelect(party.name, party.address || "Karnataka")}
                          >
                            <div className="font-medium">{party.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {party.phone} | {party.gstin || "No GST"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowAddParty(true)}
                  title="Add New Party"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label>Invoice Number</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Enter invoice number..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div>
                <Label>Items</Label>
                <p className="text-sm text-muted-foreground">Add items to your purchase</p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="text-left p-3 text-sm font-medium">#</th>
                        <th className="text-left p-3 text-sm font-medium min-w-[200px]">ITEM NAME</th>
                        <th className="text-left p-3 text-sm font-medium w-24">QTY</th>
                        <th className="text-left p-3 text-sm font-medium w-32">RATE</th>
                        <th className="text-left p-3 text-sm font-medium w-24">CGST</th>
                        <th className="text-left p-3 text-sm font-medium w-24">SGST</th>
                        <th className="text-left p-3 text-sm font-medium w-24">IGST</th>
                        <th className="text-right p-3 text-sm font-medium w-32">AMOUNT</th>
                        <th className="text-center p-3 text-sm font-medium w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3">
                            <div className="relative">
                              <Input
                                value={productSearchQueries[item.id] || item.productName}
                                onChange={(e) => {
                                  setProductSearchQueries({ ...productSearchQueries, [item.id]: e.target.value });
                                  setShowProductDropdowns({ ...showProductDropdowns, [item.id]: true });
                                }}
                                onFocus={() => setShowProductDropdowns({ ...showProductDropdowns, [item.id]: true })}
                                onBlur={() => setTimeout(() => setShowProductDropdowns({ ...showProductDropdowns, [item.id]: false }), 200)}
                                placeholder="Search item..."
                                className="w-full"
                              />
                              {showProductDropdowns[item.id] && getFilteredProducts(item.id).length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto z-50">
                                  {getFilteredProducts(item.id).map((product) => (
                                    <div
                                      key={product.id}
                                      className="px-3 py-2 hover:bg-accent cursor-pointer"
                                      onClick={() => handleProductSelect(item.id, product.id.toString(), product.name)}
                                    >
                                      <div className="font-medium">{product.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {product.sku} | ₹{product.purchasePrice}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={item.qty || ""}
                              onChange={(e) => handleItemUpdate(item.id, "qty", parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              step="0.01"
                              value={item.rate || ""}
                              onChange={(e) => handleItemUpdate(item.id, "rate", parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-full"
                            />
                          </td>
                          <td className="p-3">
                            <div className="text-sm">₹{((item.qty * item.rate * item.cgst) / 100).toFixed(2)}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">₹{((item.qty * item.rate * item.sgst) / 100).toFixed(2)}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">₹{((item.qty * item.rate * item.igst) / 100).toFixed(2)}</div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="font-medium">₹{item.amount.toFixed(2)}</div>
                          </td>
                          <td className="p-3 text-center">
                            {items.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item.id)}
                                className="h-8 w-8"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 border-t">
                  <Button variant="outline" size="sm" onClick={handleAddItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            </div>

            {/* Narration */}
            <div>
              <Label>Narration</Label>
              <Textarea
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Add any notes or remarks..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Total Amount */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <Label className="text-lg font-semibold">Total Amount</Label>
                  <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setPartyName("");
                setInvoiceNumber("");
                setNarration("");
                setItems([{
                  id: "1",
                  productId: "",
                  productName: "",
                  qty: 0,
                  rate: 0,
                  cgst: 0,
                  sgst: 0,
                  igst: 0,
                  amount: 0,
                }]);
              }}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button onClick={handleSavePurchase} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Purchase"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Party Dialog */}
        <Dialog open={showAddParty} onOpenChange={setShowAddParty}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Party</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Party Name *</Label>
                <Input
                  value={newParty.name}
                  onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                  placeholder="Enter party name..."
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newParty.phone}
                  onChange={(e) => setNewParty({ ...newParty, phone: e.target.value })}
                  placeholder="Enter phone number..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newParty.email}
                  onChange={(e) => setNewParty({ ...newParty, email: e.target.value })}
                  placeholder="Enter email..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={newParty.address}
                  onChange={(e) => setNewParty({ ...newParty, address: e.target.value })}
                  placeholder="Enter address..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>GSTIN</Label>
                <Input
                  value={newParty.gstin}
                  onChange={(e) => setNewParty({ ...newParty, gstin: e.target.value })}
                  placeholder="Enter GST number..."
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddParty(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddParty} disabled={!newParty.name.trim()}>
                Add Party
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
