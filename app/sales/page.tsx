"use client";

import { useState, useEffect, useRef } from "react";
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
import { Loader2, Plus, X } from "lucide-react";
import { salesApi } from "@/lib/api/sales";
import { Product, Party } from "@/types";
import { SaleReceipt } from "./components/SaleReceipt";

interface SaleItem {
  id: string;
  productId: number;
  productName: string;
  sku: string;
  availableStock: number;
  quantity: number;
  rate: number;
  cgst: number;
  sgst: number;
  igst: number;
  amount: number;
  unit: string;
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [voucherNo, setVoucherNo] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [saleTime, setSaleTime] = useState(new Date().toTimeString().slice(0, 5));
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [partySearch, setPartySearch] = useState("");
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  
  const [items, setItems] = useState<SaleItem[]>([{
    id: '1',
    productId: 0,
    productName: '',
    sku: '',
    availableStock: 0,
    quantity: 0,
    rate: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    amount: 0,
    unit: ''
  }]);
  
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [focusedField, setFocusedField] = useState<'product' | 'quantity' | null>('product');
  
  const [narration, setNarration] = useState("");
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CARD' | 'UPI' | 'CREDIT' | 'BANK_TRANSFER'>('CASH');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID' | 'PARTIAL'>('PAID');
  
  // Add party dialog
  const [showAddParty, setShowAddParty] = useState(false);
  const [newParty, setNewParty] = useState({
    name: '',
    phone: '',
    gstin: '',
    address: ''
  });
  
  // Receipt state
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);
  
  // Refs
  const partyInputRef = useRef<HTMLInputElement>(null);
  const productInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const quantityInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const partyDropdownRef = useRef<HTMLDivElement>(null);
  const productDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Dropdown position state
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close party dropdown
      if (partyDropdownRef.current && !partyDropdownRef.current.contains(event.target as Node) &&
          partyInputRef.current && !partyInputRef.current.contains(event.target as Node)) {
        setShowPartyDropdown(false);
      }
      
      // Close product dropdown
      if (showProductDropdown) {
        const currentDropdown = productDropdownRefs.current[currentItemIndex];
        const currentInput = productInputRefs.current[currentItemIndex];
        if (currentDropdown && !currentDropdown.contains(event.target as Node) &&
            currentInput && !currentInput.contains(event.target as Node)) {
          setShowProductDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProductDropdown, currentItemIndex]);

  // Update dropdown position on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (showProductDropdown) {
        // Find the active input and recalculate position
        const activeInput = document.activeElement as HTMLInputElement;
        if (activeInput && activeInput.tagName === 'INPUT') {
          const rect = activeInput.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: Math.max(rect.width, 400)
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showProductDropdown]);

  const loadData = async () => {
    try {
      const { productApi } = await import('@/lib/api/products');
      const { partyApi } = await import('@/lib/api/parties');
      
      const [productsData, partiesData, nextVoucher] = await Promise.all([
        productApi.getAll(),
        partyApi.getAllParties(),
        salesApi.getNextVoucherNo()
      ]);
      
      setProducts(productsData);
      setParties(partiesData.filter(p => p.partyType === 'CUSTOMER'));
      setVoucherNo(nextVoucher);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter parties based on search
  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(partySearch.toLowerCase()) ||
    party.phone?.includes(partySearch)
  );

  // Filter products based on search for current item
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Handle party selection
  const handlePartySelect = (party: Party) => {
    setSelectedParty(party);
    setPartySearch(party.name);
    setShowPartyDropdown(false);
    // Focus on first product input
    setTimeout(() => {
      productInputRefs.current[0]?.focus();
    }, 100);
  };

  // Handle party input blur
  const handlePartyBlur = () => {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      if (!selectedParty) {
        setPartySearch('');
      }
      setShowPartyDropdown(false);
    }, 200);
  };

  // Handle party search with keyboard
  const handlePartyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (filteredParties.length > 0) {
        handlePartySelect(filteredParties[0]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowPartyDropdown(true);
    }
  };

  // Handle product selection
  const handleProductSelect = (product: Product, itemIndex: number) => {
    const updatedItems = [...items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      productId: product.id,
      productName: product.name,
      sku: product.sku || '',
      availableStock: product.stock || 0,
      rate: product.sellingPrice || 0,
      unit: product.unit || 'pcs',
      cgst: 0,
      sgst: 0,
      igst: 0,
      amount: 0
    };
    setItems(updatedItems);
    setProductSearch("");
    setShowProductDropdown(false);
    setFocusedField('quantity');
    setCurrentItemIndex(-1); // Clear current item index
    
    // Focus on quantity input
    setTimeout(() => {
      quantityInputRefs.current[itemIndex]?.focus();
    }, 100);
  };

  // Handle product search with keyboard navigation
  const handleProductKeyDown = (e: React.KeyboardEvent, itemIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length > 0 && showProductDropdown) {
        handleProductSelect(filteredProducts[selectedProductIndex], itemIndex);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowProductDropdown(true);
      const newIndex = selectedProductIndex < filteredProducts.length - 1 ? selectedProductIndex + 1 : selectedProductIndex;
      setSelectedProductIndex(newIndex);
      // Auto-scroll to selected item
      setTimeout(() => {
        const dropdown = document.querySelector('.product-dropdown-sales');
        const selectedItem = dropdown?.children[newIndex] as HTMLElement;
        if (selectedItem) {
          selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }, 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = selectedProductIndex > 0 ? selectedProductIndex - 1 : 0;
      setSelectedProductIndex(newIndex);
      // Auto-scroll to selected item
      setTimeout(() => {
        const dropdown = document.querySelector('.product-dropdown-sales');
        const selectedItem = dropdown?.children[newIndex] as HTMLElement;
        if (selectedItem) {
          selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }, 0);
    } else if (e.key === 'Escape') {
      setShowProductDropdown(false);
    }
  };

  // Handle quantity change and Enter key to move to rate
  const handleQuantityKeyDown = (e: React.KeyboardEvent, itemIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus on rate input (currently rate is auto-filled, so skip to add new item)
      const item = items[itemIndex];
      if (item.quantity > 0 && item.productId > 0) {
        // Add new item
        const newItem: SaleItem = {
          id: Date.now().toString(),
          productId: 0,
          productName: '',
          sku: '',
          availableStock: 0,
          quantity: 0,
          rate: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          amount: 0,
          unit: ''
        };
        setItems([...items, newItem]);
        setCurrentItemIndex(itemIndex + 1);
        setFocusedField('product');
        setProductSearch("");
        
        // Focus on next product input
        setTimeout(() => {
          productInputRefs.current[itemIndex + 1]?.focus();
        }, 100);
      }
    }
  };

  // Handle quantity change
  const handleQuantityChange = (itemIndex: number, quantity: number) => {
    const updatedItems = [...items];
    const item = updatedItems[itemIndex];
    
    if (quantity > item.availableStock) {
      alert(`Insufficient stock! Available: ${item.availableStock}`);
      return;
    }
    
    const subtotal = quantity * item.rate;
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const amount = subtotal + cgst + sgst;
    
    updatedItems[itemIndex] = {
      ...item,
      quantity,
      cgst,
      sgst,
      amount
    };
    
    setItems(updatedItems);
  };

  // Remove item
  const removeItem = (itemIndex: number) => {
    if (items.length === 1) {
      alert('At least one item is required');
      return;
    }
    setItems(items.filter((_, idx) => idx !== itemIndex));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const totalCgst = items.reduce((sum, item) => sum + item.cgst, 0);
    const totalSgst = items.reduce((sum, item) => sum + item.sgst, 0);
    const totalTax = totalCgst + totalSgst;
    const grandTotal = subtotal + totalTax;
    
    return { subtotal, cgst: totalCgst, sgst: totalSgst, totalTax, grandTotal };
  };

  // Add new party
  const handleAddParty = async () => {
    if (!newParty.name || !newParty.phone) {
      alert('Party name and phone are required');
      return;
    }

    try {
      const { partyApi } = await import('@/lib/api/parties');
      const addedParty = await partyApi.createParty({
        name: newParty.name,
        phone: newParty.phone,
        email: '',
        address: newParty.address,
        gstin: newParty.gstin,
        partyType: 'CUSTOMER'
      });

      setParties([...parties, addedParty]);
      setSelectedParty(addedParty);
      setPartySearch(addedParty.name);
      setShowAddParty(false);
      setNewParty({ name: '', phone: '', gstin: '', address: '' });
      
      // Focus on first product input
      setTimeout(() => {
        productInputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      console.error('Failed to add party:', error);
      alert('Failed to add party');
    }
  };

  // Confirm sale
  const handleConfirmSale = async (printReceipt: boolean = false) => {
    const validItems = items.filter(item => item.productId > 0 && item.quantity > 0);
    
    if (validItems.length === 0) {
      alert('Please add at least one item with quantity');
      return;
    }
    if (!selectedParty) {
      alert('Please select a customer');
      return;
    }

    setSaving(true);
    try {
      const totals = calculateTotals();
      
      const saleCommand = {
        partyId: selectedParty.id,
        saleDate,
        subtotal: totals.subtotal,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: 0,
        discount: 0,
        discountType: 'PERCENTAGE' as const,
        roundOff: 0,
        grandTotal: totals.grandTotal,
        paymentMode,
        paymentStatus,
        paidAmount: paymentStatus === 'PAID' ? totals.grandTotal : 0,
        narration,
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          rate: item.rate
        }))
      };

      const result = await salesApi.createSale(saleCommand);
      setCompletedSale(result);
      
      if (printReceipt) {
        setShowReceipt(true);
        setTimeout(() => {
          window.print();
        }, 500);
      } else {
        alert(`✅ Sale completed successfully!\nVoucher No: ${result.voucherNo}`);
        resetForm();
      }
    } catch (error: any) {
      console.error('Failed to create sale:', error);
      alert(`❌ Failed to create sale: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedParty(null);
    setPartySearch("");
    setItems([{
      id: '1',
      productId: 0,
      productName: '',
      sku: '',
      availableStock: 0,
      quantity: 0,
      rate: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      amount: 0,
      unit: ''
    }]);
    setCurrentItemIndex(0);
    setProductSearch("");
    setNarration("");
    setPaymentMode('CASH');
    setPaymentStatus('PAID');
    setInvoiceNumber("");
    loadData(); // Reload to get new voucher number
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </Layout>
    );
  }

  if (showReceipt && completedSale) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between mb-4 print:hidden">
            <Button onClick={() => { setShowReceipt(false); resetForm(); }} variant="outline">
              Back to Sales
            </Button>
            <Button onClick={() => window.print()}>
              Print Receipt
            </Button>
          </div>
          <SaleReceipt 
            sale={completedSale}
            party={selectedParty || undefined}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-6 space-y-6">
        {/* Header Section */}
        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-600 dark:text-gray-400 text-sm">Voucher No</Label>
              <Input
                value={voucherNo}
                readOnly
                className="mt-1 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400 text-sm">Date</Label>
              <Input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="mt-1 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400 text-sm">Time</Label>
              <Input
                type="time"
                value={saleTime}
                onChange={(e) => setSaleTime(e.target.value)}
                className="mt-1 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </Card>

        {/* Party Selection */}
        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Label className="text-gray-600 dark:text-gray-400 text-sm">Party Name</Label>
              <div className="flex gap-2 mt-1">
                <div className="flex-1 relative">
                  <Input
                    ref={partyInputRef}
                    value={partySearch}
                    onChange={(e) => {
                      setPartySearch(e.target.value);
                      setShowPartyDropdown(true);
                      setSelectedParty(null);
                    }}
                    onKeyDown={handlePartyKeyDown}
                    onFocus={() => setShowPartyDropdown(true)}
                    onBlur={handlePartyBlur}
                    placeholder="Search party..."
                    className="bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                  
                  {/* Party Dropdown */}
                  {showPartyDropdown && filteredParties.length > 0 && (
                    <div 
                      ref={partyDropdownRef}
                      className="absolute z-[100] mt-1 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-md shadow-xl max-h-60 overflow-auto w-full"
                    >
                      {filteredParties.map((party, index) => (
                        <div
                          key={party.id}
                          onClick={() => handlePartySelect(party)}
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2a2a2a] ${
                            index === 0 ? 'bg-gray-100 dark:bg-[#2a2a2a]' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{party.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{party.phone}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setShowAddParty(true)}
                  className="bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] border border-gray-300 dark:border-gray-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400 text-sm">Invoice Number</Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Enter invoice number..."
                className="mt-1 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </Card>

        {/* Items Section */}
        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 p-6 overflow-visible">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add items to your purchase</p>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">#</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">ITEM NAME</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">QTY</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">AVAILABLE STOCK</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">RATE</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">CGST</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">SGST</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">IGST</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">AMOUNT</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{index + 1}</td>
                    <td className="py-3 px-2">
                      <div className="relative">
                        <Input
                          ref={(el) => { productInputRefs.current[index] = el; }}
                          value={index === currentItemIndex && !item.productName ? productSearch : item.productName}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Clear the item if user is typing
                            const updatedItems = [...items];
                            updatedItems[index] = {
                              ...updatedItems[index],
                              productId: 0,
                              productName: '',
                              sku: '',
                              availableStock: 0,
                              rate: 0,
                              amount: 0
                            };
                            setItems(updatedItems);
                            setProductSearch(value);
                            setCurrentItemIndex(index);
                            setShowProductDropdown(true);
                            setSelectedProductIndex(0);
                            // Update dropdown position
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDropdownPosition({
                              top: rect.bottom + window.scrollY,
                              left: rect.left + window.scrollX,
                              width: Math.max(rect.width, 400)
                            });
                          }}
                          onKeyDown={(e) => handleProductKeyDown(e, index)}
                          onFocus={(e) => {
                            setCurrentItemIndex(index);
                            setFocusedField('product');
                            if (!item.productName) {
                              setProductSearch('');
                              setShowProductDropdown(true);
                            }
                            // Calculate dropdown position
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDropdownPosition({
                              top: rect.bottom + window.scrollY,
                              left: rect.left + window.scrollX,
                              width: Math.max(rect.width, 400)
                            });
                          }}
                          onBlur={() => {
                            // Delay to allow click on dropdown item
                            setTimeout(() => {
                              if (!items[index].productName) {
                                setProductSearch('');
                              }
                              setShowProductDropdown(false);
                            }, 200);
                          }}
                          placeholder="Search item..."
                          className="bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white min-w-[200px]"
                        />
                        
                        {/* Product Dropdown - Fixed positioning to break out of table */}
                        {showProductDropdown && currentItemIndex === index && filteredProducts.length > 0 && dropdownPosition && (
                          <div 
                            ref={(el) => { productDropdownRefs.current[index] = el; }}
                            className="fixed z-[9999] bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-md shadow-xl max-h-60 overflow-auto product-dropdown-sales"
                            style={{
                              top: `${dropdownPosition.top}px`,
                              left: `${dropdownPosition.left}px`,
                              width: `${dropdownPosition.width}px`,
                              marginTop: '4px'
                            }}
                          >
                            {filteredProducts.map((product, pIndex) => (
                              <div
                                key={product.id}
                                onClick={() => handleProductSelect(product, index)}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2a2a2a] ${
                                  pIndex === selectedProductIndex ? 'bg-gray-100 dark:bg-[#2a2a2a]' : ''
                                }`}
                              >
                                <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  SKU: {product.sku} | Stock: {product.stock} | ₹{product.sellingPrice}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Input
                        ref={(el) => { quantityInputRefs.current[index] = el; }}
                        type="number"
                        min="0"
                        max={item.availableStock}
                        value={item.quantity || ''}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                        onKeyDown={(e) => handleQuantityKeyDown(e, index)}
                        className="bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-right w-20"
                      />
                    </td>
                    <td className="py-3 px-2 text-right text-gray-400">
                      {item.availableStock > 0 ? `${item.availableStock}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-900 dark:text-white">
                      ₹{item.rate.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">
                      ₹{item.cgst.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">
                      ₹{item.sgst.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">
                      ₹{item.igst.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-gray-900 dark:text-white">
                      ₹{item.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-2">
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
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
        </Card>

        {/* Narration */}
        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 p-6">
          <Label className="text-gray-600 dark:text-gray-400 text-sm">Narration</Label>
          <Input
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder="Add any notes or remarks..."
            className="mt-1 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
          />
        </Card>

        {/* Totals and Payment */}
        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 p-6">
          <div className="flex justify-end mb-6">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                <span className="font-bold text-2xl text-gray-900 dark:text-white">₹{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600 dark:text-gray-400 text-sm">Payment Mode</Label>
              <select
                value={paymentMode}
                onChange={(e: any) => setPaymentMode(e.target.value)}
                className="mt-1 w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400 text-sm">Payment Status</Label>
              <select
                value={paymentStatus}
                onChange={(e: any) => setPaymentStatus(e.target.value)}
                className="mt-1 w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button
              onClick={() => handleConfirmSale(false)}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Sale'
              )}
            </Button>

            <Button
              onClick={() => handleConfirmSale(true)}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm & Print'
              )}
            </Button>
          </div>
        </Card>

        {/* Add Party Dialog */}
        <Dialog open={showAddParty} onOpenChange={setShowAddParty}>
          <DialogContent className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>Add New Party</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-gray-600 dark:text-gray-400 text-sm">Party Name *</Label>
                <Input
                  value={newParty.name}
                  onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                  placeholder="Enter party name..."
                  className="mt-1 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label className="text-gray-600 dark:text-gray-400 text-sm">Contact Number *</Label>
                <Input
                  value={newParty.phone}
                  onChange={(e) => setNewParty({ ...newParty, phone: e.target.value })}
                  placeholder="Enter contact number..."
                  className="mt-1 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label className="text-gray-600 dark:text-gray-400 text-sm">GST Number</Label>
                <Input
                  value={newParty.gstin}
                  onChange={(e) => setNewParty({ ...newParty, gstin: e.target.value })}
                  placeholder="Enter GST number..."
                  className="mt-1 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label className="text-gray-600 dark:text-gray-400 text-sm">State *</Label>
                <Input
                  value={newParty.address}
                  onChange={(e) => setNewParty({ ...newParty, address: e.target.value })}
                  placeholder="Enter state name..."
                  className="mt-1 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddParty(false)}
                className="border-gray-300 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddParty}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Party
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
