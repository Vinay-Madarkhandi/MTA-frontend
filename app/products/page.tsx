"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Printer,
  Save,
  X as CloseIcon,
  FileText,
  Calculator,
  Plus,
} from "lucide-react";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface VoucherLine {
  id: string;
  productId: string;
  productName: string;
  description: string;
  qty: number;
  uom: string;
  rate: number; // rate per unit in rupees
  discountPercent: number;
  cgst: number; // CGST amount in rupees
  sgst: number; // SGST amount in rupees
  igst: number; // IGST amount in rupees
  taxRate: number; // total tax percentage
  taxAmount: number; // tax amount in rupees
  amount: number; // total amount in rupees (including tax)
}

interface Product {
  id: string;
  name: string;
  hsn: string;
  rate: number;
  uom: string;
  taxRate: number;
}

interface Ledger {
  id: string;
  name: string;
  group: string;
}

interface Party {
  id: string;
  name: string;
  contact?: string;
  gst?: string;
  state: string; // State where party is located
}

interface Voucher {
  voucherType: "Purchase" | "Payment" | "PR" | "Contra";
  voucherNumber: string;
  date: string;
  partyLedger: string;
  narration: string;
  lines: VoucherLine[];
  otherCharges: number;
  roundOff: number;
  taxInclusive: boolean;
  companyState: string;
  partyState: string;
}

interface JournalEntry {
  ledger: string;
  debit: number;
  credit: number;
}

// ============================================================================
// HELPER FUNCTIONS - Monetary calculations in paisa
// ============================================================================

const toPaisa = (amount: number): number => Math.round(amount * 100);
const fromPaisa = (paisa: number): number => paisa / 100;
const formatCurrency = (amount: number): string =>
  `₹${Number(amount).toFixed(2)}`;

// TODO: Replace with actual product API
const MOCK_PRODUCTS: Product[] = [
  {
    id: "P001",
    name: "Rice - Basmati 1kg",
    hsn: "1006",
    rate: 150,
    uom: "kg",
    taxRate: 5,
  },
  {
    id: "P002",
    name: "Wheat Flour 1kg",
    hsn: "1101",
    rate: 45,
    uom: "kg",
    taxRate: 5,
  },
  {
    id: "P003",
    name: "Fertilizer NPK",
    hsn: "3105",
    rate: 850,
    uom: "kg",
    taxRate: 18,
  },
  {
    id: "P004",
    name: "Seeds - Tomato",
    hsn: "1209",
    rate: 320,
    uom: "pkt",
    taxRate: 12,
  },
  {
    id: "P005",
    name: "Pesticide Spray",
    hsn: "3808",
    rate: 450,
    uom: "ltr",
    taxRate: 18,
  },
  {
    id: "P006",
    name: "Cotton Seeds 1kg",
    hsn: "1207",
    rate: 280,
    uom: "kg",
    taxRate: 5,
  },
  {
    id: "P007",
    name: "Organic Manure 50kg",
    hsn: "3101",
    rate: 650,
    uom: "bag",
    taxRate: 12,
  },
];

// TODO: Replace with actual ledger API
const MOCK_LEDGERS: Ledger[] = [
  { id: "L001", name: "ABC Suppliers", group: "Sundry Creditors" },
  { id: "L002", name: "XYZ Traders", group: "Sundry Creditors" },
  { id: "L003", name: "Purchase Account", group: "Purchase Accounts" },
  { id: "L004", name: "CGST Input", group: "Duties & Taxes" },
  { id: "L005", name: "SGST Input", group: "Duties & Taxes" },
  { id: "L006", name: "IGST Input", group: "Duties & Taxes" },
];

// Initial mock parties data
const INITIAL_MOCK_PARTIES: Party[] = [
  {
    id: "PT001",
    name: "ABC Suppliers",
    contact: "9876543210",
    gst: "29ABCDE1234F1Z5",
    state: "Karnataka", // Same state as company - CGST+SGST
  },
  {
    id: "PT002",
    name: "XYZ Traders",
    contact: "9876543211",
    gst: "19XYZAB5678G2W3", // GST starts with 19 = West Bengal
    state: "West Bengal", // Different state - IGST
  },
  {
    id: "PT003",
    name: "DEF Enterprises",
    contact: "9876543212",
    gst: "27DEFGH9012H3X4", // GST starts with 27 = Maharashtra
    state: "Maharashtra", // Different state - IGST
  },
  {
    id: "PT004",
    name: "GHI Industries",
    contact: "9876543213",
    gst: "29GHIJK3456I4Y5",
    state: "Karnataka", // Same state as company - CGST+SGST
  },
];

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

function calculateLineAmounts(
  line: Partial<VoucherLine>,
  taxInclusive: boolean
): { taxAmount: number; amount: number; baseAmount: number } {
  const qty = line.qty || 0;
  const rate = toPaisa(line.rate || 0);
  const discountPercent = line.discountPercent || 0;
  const taxRate = line.taxRate || 0;

  let baseAmount = qty * rate;
  const discountAmount = Math.round((baseAmount * discountPercent) / 100);
  baseAmount = baseAmount - discountAmount;

  let taxAmount = 0;
  let amount = 0;

  if (taxInclusive) {
    amount = baseAmount;
    taxAmount = Math.round((baseAmount * taxRate) / (100 + taxRate));
  } else {
    taxAmount = Math.round((baseAmount * taxRate) / 100);
    amount = baseAmount + taxAmount;
  }

  return { taxAmount, amount, baseAmount };
}

function calculateTotals(
  lines: VoucherLine[],
  otherCharges: number,
  roundOff: number,
  companyState: string,
  partyState: string
) {
  const subtotal = lines.reduce(
    (sum, line) => sum + (line.amount - line.taxAmount),
    0
  );
  const totalTax = lines.reduce((sum, line) => sum + line.taxAmount, 0);

  const isInterstate = companyState !== partyState;
  const igst = isInterstate ? totalTax : 0;
  const cgst = !isInterstate ? totalTax / 2 : 0;
  const sgst = !isInterstate ? totalTax / 2 : 0;

  const grandTotal = subtotal + totalTax + otherCharges + roundOff;

  return { subtotal, totalTax, igst, cgst, sgst, grandTotal };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TallyPurchaseVoucher() {
  const [voucher, setVoucher] = useState<Voucher>({
    voucherType: "Purchase",
    voucherNumber: "",
    date: new Date().toISOString().split("T")[0],
    partyLedger: "",
    narration: "",
    lines: [
      {
        id: "1",
        productId: "",
        productName: "",
        description: "",
        qty: 0,
        uom: "kg",
        rate: 0,
        discountPercent: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        taxRate: 0,
        taxAmount: 0,
        amount: 0,
      },
    ],
    otherCharges: 0,
    roundOff: 0,
    taxInclusive: false,
    companyState: "Karnataka",
    partyState: "Karnataka",
  });

  const [focusedCell, setFocusedCell] = useState<{ row: number; col: string }>({
    row: 0,
    col: "productName",
  });

  const [autocompleteResults, setAutocompleteResults] = useState<Product[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [showAddParty, setShowAddParty] = useState(false);
  const [newParty, setNewParty] = useState({
    name: "",
    contact: "",
    gst: "",
    state: "",
  });
  const [parties, setParties] = useState<Party[]>(INITIAL_MOCK_PARTIES);
  const [partySearchQuery, setPartySearchQuery] = useState("");
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [filteredParties, setFilteredParties] = useState<Party[]>(parties);
  const [productSearchQueries, setProductSearchQueries] = useState<{
    [key: number]: string;
  }>({});
  const [showProductDropdown, setShowProductDropdown] = useState<{
    [key: number]: boolean;
  }>({});
  const [filteredProducts, setFilteredProducts] = useState<{
    [key: number]: Product[];
  }>({});

  const cellRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Filter parties based on search query
  useEffect(() => {
    if (partySearchQuery.trim() === "") {
      setFilteredParties(parties);
    } else {
      const query = partySearchQuery.toLowerCase();
      const filtered = parties.filter(
        (party) =>
          party.name.toLowerCase().includes(query) ||
          party.contact?.toLowerCase().includes(query) ||
          party.gst?.toLowerCase().includes(query)
      );
      setFilteredParties(filtered);
    }
  }, [partySearchQuery, parties]);

  // Recalculate GST when party changes
  useEffect(() => {
    const selectedParty = parties.find((p) => p.name === voucher.partyLedger);
    if (selectedParty) {
      const partyState = selectedParty.state || voucher.companyState;
      const isInterstate = voucher.companyState !== partyState;

      // Update all lines with GST calculations based on new party state
      const updatedLines = voucher.lines.map((line) => {
        if (line.qty > 0 && line.rate > 0 && line.taxRate > 0) {
          const baseAmount = line.qty * line.rate;
          const taxAmount = (baseAmount * line.taxRate) / 100;

          if (isInterstate) {
            return {
              ...line,
              igst: taxAmount,
              cgst: 0,
              sgst: 0,
              taxAmount: taxAmount,
              amount: baseAmount + taxAmount,
            };
          } else {
            const cgstAmount = taxAmount / 2;
            const sgstAmount = taxAmount / 2;
            return {
              ...line,
              cgst: cgstAmount,
              sgst: sgstAmount,
              igst: 0,
              taxAmount: taxAmount,
              amount: baseAmount + taxAmount,
            };
          }
        }
        return line;
      });

      if (JSON.stringify(updatedLines) !== JSON.stringify(voucher.lines)) {
        setVoucher({ ...voucher, lines: updatedLines });
      }
    }
  }, [voucher.partyLedger, parties]);

  // Filter products for each row
  const filterProductsForRow = (rowIndex: number, query: string) => {
    console.log("Filtering products for row", rowIndex, "with query:", query);
    if (query.trim() === "") {
      console.log("Empty query, showing all products");
      setFilteredProducts({ ...filteredProducts, [rowIndex]: MOCK_PRODUCTS });
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = MOCK_PRODUCTS.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerQuery) ||
          product.hsn.toLowerCase().includes(lowerQuery)
      );
      console.log("Filtered products:", filtered.length, "items");
      setFilteredProducts({ ...filteredProducts, [rowIndex]: filtered });
    }
  };

  // Hide dropdowns on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowPartyDropdown(false);
      setShowProductDropdown({});
    };

    // Listen to both table scroll and window scroll
    const scrollContainer = document.querySelector(".overflow-x-auto");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        handleSaveDraft();
      }
      if (e.key === "F8") {
        e.preventDefault();
        handlePost();
      }
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handlePost();
      }
      if (e.key === "Escape") {
        if (showPrintPreview || showQuickAdd) {
          setShowPrintPreview(false);
          setShowQuickAdd(false);
        }
      }
      if (e.altKey && e.key === "c") {
        e.preventDefault();
        setShowQuickAdd(true);
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [showPrintPreview, showQuickAdd]);

  // ============================================================================
  // DATA HANDLERS
  // ============================================================================

  const updateLine = (
    rowIndex: number,
    field: keyof VoucherLine,
    value: any
  ) => {
    const newLines = [...voucher.lines];
    newLines[rowIndex] = { ...newLines[rowIndex], [field]: value };

    // If product is selected, auto-populate tax rate
    if (field === "productId" && value) {
      const product = MOCK_PRODUCTS.find((p) => p.id === value);
      if (product) {
        newLines[rowIndex].taxRate = product.taxRate;
      }
    }

    // Recalculate amounts and GST breakdown if relevant fields change
    if (
      ["qty", "rate", "discountPercent", "taxRate", "productId"].includes(field)
    ) {
      const line = newLines[rowIndex];

      // Find the selected party to get its state
      const selectedParty = parties.find((p) => p.name === voucher.partyLedger);
      const partyState = selectedParty?.state || voucher.companyState; // Default to company state if party not found

      // Interstate check: Compare company state with party's state (where goods are being supplied)
      const isInterstate = voucher.companyState !== partyState;

      // Calculate base amount (no paisa conversion - use direct values)
      const qty = line.qty || 0;
      const rate = line.rate || 0;
      const baseAmount = qty * rate;

      // Get the total tax rate from product (this is the combined GST rate)
      const totalTaxRate = line.taxRate || 0;

      // Determine GST amounts based on state
      if (isInterstate) {
        // Interstate: Use IGST only (full tax amount)
        const taxAmount = (baseAmount * totalTaxRate) / 100;
        newLines[rowIndex].igst = taxAmount;
        newLines[rowIndex].cgst = 0;
        newLines[rowIndex].sgst = 0;
        newLines[rowIndex].taxAmount = taxAmount;
        newLines[rowIndex].amount = baseAmount + taxAmount;
      } else {
        // Intrastate: Split into CGST and SGST (50-50 of total tax amount)
        const taxAmount = (baseAmount * totalTaxRate) / 100;
        const cgstAmount = taxAmount / 2;
        const sgstAmount = taxAmount / 2;

        newLines[rowIndex].cgst = cgstAmount;
        newLines[rowIndex].sgst = sgstAmount;
        newLines[rowIndex].igst = 0;
        newLines[rowIndex].taxAmount = taxAmount;
        newLines[rowIndex].amount = baseAmount + taxAmount;
      }
    }

    setVoucher({ ...voucher, lines: newLines });
  };

  const searchProducts = (query: string) => {
    // TODO: Replace with API call: await productApi.search(query)
    if (query.length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }
    const results = MOCK_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    setAutocompleteResults(results);
    setShowAutocomplete(results.length > 0);
  };

  const selectProduct = (rowIndex: number, product: Product) => {
    updateLine(rowIndex, "productId", product.id);
    updateLine(rowIndex, "productName", product.name);
    updateLine(rowIndex, "rate", product.rate);
    updateLine(rowIndex, "uom", product.uom);
    updateLine(rowIndex, "taxRate", product.taxRate);
    setShowAutocomplete(false);

    // Move focus to quantity
    const qtyCell = cellRefs.current[`${rowIndex}-qty`];
    if (qtyCell) qtyCell.focus();
  };

  const handleCellKeyDown = (
    e: React.KeyboardEvent,
    rowIndex: number,
    colKey: string
  ) => {
    const columns = [
      "productName",
      "description",
      "qty",
      "uom",
      "rate",
      "discountPercent",
      "taxRate",
      "amount",
    ];
    const colIndex = columns.indexOf(colKey);

    // Enter - move to next column or next row
    if (e.key === "Enter") {
      e.preventDefault();
      if (colIndex === columns.length - 1) {
        // Last column - move to next row, create if needed
        if (rowIndex === voucher.lines.length - 1) {
          addNewLine();
        }
        const nextCell = cellRefs.current[`${rowIndex + 1}-${columns[0]}`];
        if (nextCell) nextCell.focus();
      } else {
        const nextCell =
          cellRefs.current[`${rowIndex}-${columns[colIndex + 1]}`];
        if (nextCell) nextCell.focus();
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
    if (e.key === "ArrowDown" && rowIndex < voucher.lines.length - 1) {
      e.preventDefault();
      const downCell = cellRefs.current[`${rowIndex + 1}-${colKey}`];
      if (downCell) downCell.focus();
    }
  };

  const addNewLine = () => {
    const newLine: VoucherLine = {
      id: `${voucher.lines.length + 1}`,
      productId: "",
      productName: "",
      description: "",
      qty: 0,
      uom: "kg",
      rate: 0,
      discountPercent: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      taxRate: 18,
      taxAmount: 0,
      amount: 0,
    };
    setVoucher({ ...voucher, lines: [...voucher.lines, newLine] });
  };

  // ============================================================================
  // SAVE & POST HANDLERS
  // ============================================================================

  const handleSaveDraft = () => {
    console.log("💾 Saving draft...", voucher);
    // TODO: API call: await voucherApi.saveDraft(voucher)
    alert("Draft saved successfully! (Check console for payload)");
  };

  const handlePost = () => {
    // Validate
    const validLines = voucher.lines.filter((l) => l.qty > 0 && l.productName);
    if (validLines.length === 0) {
      alert("Please add at least one item with quantity");
      return;
    }
    if (!voucher.partyLedger) {
      alert("Please select party ledger");
      return;
    }

    console.log("✅ Posting voucher...", voucher);
    // TODO: API call: await voucherApi.post(voucher)
    alert("Voucher posted successfully! Opening print preview...");
    setShowPrintPreview(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleQuickAddProduct = () => {
    // TODO: API call: await productApi.create({ name: newProductName })
    console.log("➕ Quick adding product:", newProductName);
    alert(`Product "${newProductName}" added successfully!`);
    setNewProductName("");
    setShowQuickAdd(false);
  };

  // ============================================================================
  // JOURNAL PREVIEW
  // ============================================================================

  const totals = calculateTotals(
    voucher.lines,
    voucher.otherCharges,
    voucher.roundOff,
    voucher.companyState,
    voucher.partyState
  );

  const generateJournal = (): JournalEntry[] => {
    const journal: JournalEntry[] = [];

    // Purchase/Inventory Debit
    journal.push({
      ledger: "Purchase Account",
      debit: totals.subtotal,
      credit: 0,
    });

    // Tax Debit
    if (totals.igst > 0) {
      journal.push({ ledger: "IGST Input", debit: totals.igst, credit: 0 });
    } else {
      if (totals.cgst > 0)
        journal.push({ ledger: "CGST Input", debit: totals.cgst, credit: 0 });
      if (totals.sgst > 0)
        journal.push({ ledger: "SGST Input", debit: totals.sgst, credit: 0 });
    }

    // Party Credit
    journal.push({
      ledger: voucher.partyLedger || "Party Ledger",
      debit: 0,
      credit: totals.grandTotal,
    });

    return journal;
  };

  const journal = generateJournal();
  const totalDebits = journal.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = journal.reduce((sum, e) => sum + e.credit, 0);
  const isBalanced = totalDebits === totalCredits;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Layout>
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Purchase Entry</h1>
            <p className="text-muted-foreground">Add new purchase invoice</p>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-8">
              {/* Party and Invoice Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Party Name
                  </Label>
                  <div className="flex gap-3 mt-2 relative">
                    <div className="flex-1 relative">
                      <Input
                        value={partySearchQuery || voucher.partyLedger}
                        onChange={(e) => {
                          setPartySearchQuery(e.target.value);
                          // Only show dropdown if user typed at least one character
                          setShowPartyDropdown(e.target.value.length > 0);
                          if (e.target.value === "") {
                            setVoucher({ ...voucher, partyLedger: "" });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && filteredParties.length > 0) {
                            e.preventDefault();
                            const firstMatch = filteredParties[0];
                            setVoucher({
                              ...voucher,
                              partyLedger: firstMatch.name,
                            });
                            setPartySearchQuery(firstMatch.name);
                            setShowPartyDropdown(false);
                          }
                        }}
                        onFocus={() => {
                          // Only show dropdown if there's already text
                          if (partySearchQuery && partySearchQuery.length > 0) {
                            setShowPartyDropdown(true);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            // Auto-select if there's an exact match
                            const exactMatch = filteredParties.find(
                              (p) =>
                                p.name.toLowerCase() ===
                                partySearchQuery.toLowerCase()
                            );
                            if (exactMatch) {
                              setVoucher({
                                ...voucher,
                                partyLedger: exactMatch.name,
                              });
                              setPartySearchQuery(exactMatch.name);
                            }
                            setShowPartyDropdown(false);
                          }, 200);
                        }}
                        placeholder="Search party..."
                        className="w-full"
                      />
                      {showPartyDropdown && filteredParties.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredParties.map((party) => (
                            <div
                              key={party.id}
                              className="px-4 py-2 hover:bg-muted cursor-pointer"
                              onClick={() => {
                                setVoucher({
                                  ...voucher,
                                  partyLedger: party.name,
                                });
                                setPartySearchQuery(party.name);
                                setShowPartyDropdown(false);
                              }}
                            >
                              <div className="font-medium">{party.name}</div>
                              {(party.contact || party.state) && (
                                <div className="text-xs text-muted-foreground">
                                  {party.contact && `${party.contact} `}
                                  {party.gst && `• ${party.gst} `}
                                  {party.state && `• ${party.state}`}
                                  {voucher.companyState !== party.state && (
                                    <span className="ml-2 px-1 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                                      IGST Supplier
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setShowAddParty(true)}
                      title="Add New Party"
                      className="h-10 w-10 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="w-full lg:w-auto">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Invoice Number
                  </Label>
                  <Input
                    value={voucher.voucherNumber}
                    onChange={(e) =>
                      setVoucher({ ...voucher, voucherNumber: e.target.value })
                    }
                    placeholder="Enter invoice number..."
                    className="mt-2 w-full lg:w-48"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="mb-8">
                <div className="mb-4">
                  <Label className="text-lg font-semibold">Items</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add items to your purchase
                  </p>
                </div>

                <div className="border rounded-xl shadow-sm">
                  <div className="w-full">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-12">
                              #
                            </th>
                            <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-48">
                              Item Name
                            </th>
                            <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20">
                              Qty
                            </th>
                            <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24">
                              Rate
                            </th>
                            <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24">
                              CGST
                            </th>
                            <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24">
                              SGST
                            </th>
                            <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24">
                              IGST
                            </th>
                            <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-32">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-background divide-y divide-border">
                          {voucher.lines.map((line, index) => (
                            <tr
                              key={line.id}
                              className="hover:bg-muted/20 transition-colors"
                            >
                              <td className="px-3 py-4 text-center text-sm font-medium text-muted-foreground">
                                {index + 1}
                              </td>
                              <td className="px-3 py-4 relative">
                                <Input
                                  ref={(el) => {
                                    if (el)
                                      cellRefs.current[`${index}-productName`] =
                                        el;
                                  }}
                                  value={
                                    productSearchQueries[index] ||
                                    line.productName
                                  }
                                  onChange={(e) => {
                                    const query = e.target.value;
                                    console.log(
                                      "Typing query:",
                                      query,
                                      "for row:",
                                      index
                                    );
                                    setProductSearchQueries({
                                      ...productSearchQueries,
                                      [index]: query,
                                    });
                                    // Show dropdown when typing (no length restriction)
                                    setShowProductDropdown({
                                      ...showProductDropdown,
                                      [index]: true,
                                    });
                                    console.log(
                                      "Setting dropdown visible for row:",
                                      index
                                    );
                                    filterProductsForRow(index, query);
                                    if (query === "") {
                                      updateLine(index, "productName", "");
                                      updateLine(index, "rate", 0);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const filtered =
                                        filteredProducts[index] ||
                                        MOCK_PRODUCTS;
                                      if (filtered.length > 0) {
                                        const firstMatch = filtered[0];
                                        const isInterstate =
                                          voucher.companyState !==
                                          voucher.partyState;

                                        updateLine(
                                          index,
                                          "productName",
                                          firstMatch.name
                                        );
                                        updateLine(
                                          index,
                                          "rate",
                                          firstMatch.rate
                                        );
                                        updateLine(
                                          index,
                                          "productId",
                                          firstMatch.id
                                        );
                                        updateLine(
                                          index,
                                          "taxRate",
                                          firstMatch.taxRate
                                        );

                                        setProductSearchQueries({
                                          ...productSearchQueries,
                                          [index]: firstMatch.name,
                                        });
                                        setShowProductDropdown({
                                          ...showProductDropdown,
                                          [index]: false,
                                        });
                                      }
                                      cellRefs.current[`${index}-qty`]?.focus();
                                    }
                                  }}
                                  onFocus={() => {
                                    // Show dropdown only if there's content or initialize empty search
                                    const currentQuery =
                                      productSearchQueries[index] || "";
                                    // Always initialize filtered products for this row
                                    filterProductsForRow(index, currentQuery);
                                    // Show dropdown if there's a query or start fresh
                                    if (currentQuery.length > 0) {
                                      setShowProductDropdown({
                                        ...showProductDropdown,
                                        [index]: true,
                                      });
                                    }
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => {
                                      const query =
                                        productSearchQueries[index] || "";
                                      const exactMatch = MOCK_PRODUCTS.find(
                                        (p) =>
                                          p.name.toLowerCase() ===
                                          query.toLowerCase()
                                      );
                                      if (exactMatch) {
                                        const isInterstate =
                                          voucher.companyState !==
                                          voucher.partyState;

                                        updateLine(
                                          index,
                                          "productName",
                                          exactMatch.name
                                        );
                                        updateLine(
                                          index,
                                          "rate",
                                          exactMatch.rate
                                        );
                                        updateLine(
                                          index,
                                          "productId",
                                          exactMatch.id
                                        );
                                        updateLine(
                                          index,
                                          "taxRate",
                                          exactMatch.taxRate
                                        );

                                        setProductSearchQueries({
                                          ...productSearchQueries,
                                          [index]: exactMatch.name,
                                        });
                                      }
                                      setShowProductDropdown({
                                        ...showProductDropdown,
                                        [index]: false,
                                      });
                                    }, 200);
                                  }}
                                  placeholder="Search item..."
                                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                  data-product-input={index}
                                />
                                {showProductDropdown[index] && (
                                  <div
                                    className="fixed bg-background border border-border rounded-md shadow-xl max-h-48 overflow-auto"
                                    style={{
                                      minWidth: "300px",
                                      left: `${
                                        cellRefs.current[
                                          `${index}-productName`
                                        ]?.getBoundingClientRect().left || 0
                                      }px`,
                                      top: `${
                                        (cellRefs.current[
                                          `${index}-productName`
                                        ]?.getBoundingClientRect().bottom ||
                                          0) + 2
                                      }px`,
                                      zIndex: 1000,
                                    }}
                                  >
                                    {(
                                      filteredProducts[index] || MOCK_PRODUCTS
                                    ).map((product) => (
                                      <div
                                        key={product.id}
                                        className="px-3 py-2 hover:bg-muted cursor-pointer"
                                        onClick={() => {
                                          const isInterstate =
                                            voucher.companyState !==
                                            voucher.partyState;

                                          updateLine(
                                            index,
                                            "productName",
                                            product.name
                                          );
                                          updateLine(
                                            index,
                                            "productId",
                                            product.id
                                          );
                                          // Setting taxRate will automatically trigger GST calculation
                                          updateLine(
                                            index,
                                            "taxRate",
                                            product.taxRate
                                          );

                                          setProductSearchQueries({
                                            ...productSearchQueries,
                                            [index]: product.name,
                                          });
                                          setShowProductDropdown({
                                            ...showProductDropdown,
                                            [index]: false,
                                          });
                                          setTimeout(() => {
                                            cellRefs.current[
                                              `${index}-qty`
                                            ]?.focus();
                                          }, 100);
                                        }}
                                      >
                                        <div className="font-medium text-sm text-foreground">
                                          {product.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          HSN: {product.hsn} • Tax:{" "}
                                          {product.taxRate}%
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-4">
                                <Input
                                  ref={(el) => {
                                    if (el)
                                      cellRefs.current[`${index}-qty`] = el;
                                  }}
                                  type="number"
                                  value={line.qty || ""}
                                  onChange={(e) =>
                                    updateLine(
                                      index,
                                      "qty",
                                      Number(e.target.value)
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      cellRefs.current[
                                        `${index}-rate`
                                      ]?.focus();
                                    }
                                  }}
                                  placeholder="0"
                                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-right"
                                />
                              </td>
                              <td className="px-3 py-4">
                                <Input
                                  ref={(el) => {
                                    if (el)
                                      cellRefs.current[`${index}-rate`] = el;
                                  }}
                                  type="number"
                                  step="0.01"
                                  value={line.rate || ""}
                                  onChange={(e) =>
                                    updateLine(
                                      index,
                                      "rate",
                                      Number(e.target.value)
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      addNewLine();
                                      setTimeout(() => {
                                        cellRefs.current[
                                          `${index + 1}-productName`
                                        ]?.focus();
                                      }, 100);
                                    }
                                  }}
                                  placeholder="0.00"
                                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-right"
                                />
                              </td>
                              <td className="px-3 py-4">
                                <Input
                                  type="text"
                                  value={formatCurrency(line.cgst)}
                                  readOnly
                                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-right bg-muted/30 cursor-not-allowed text-muted-foreground text-xs"
                                />
                              </td>
                              <td className="px-3 py-4">
                                <Input
                                  type="text"
                                  value={formatCurrency(line.sgst)}
                                  readOnly
                                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-right bg-muted/30 cursor-not-allowed text-muted-foreground text-xs"
                                />
                              </td>
                              <td className="px-3 py-4">
                                <Input
                                  type="text"
                                  value={formatCurrency(line.igst)}
                                  readOnly
                                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-right bg-muted/30 cursor-not-allowed text-muted-foreground text-xs"
                                />
                              </td>
                              <td className="px-3 py-4 text-right font-semibold">
                                {formatCurrency(line.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Narration */}
              <div className="mb-8">
                <Label className="text-sm font-medium text-muted-foreground">
                  Narration
                </Label>
                <Input
                  value={voucher.narration}
                  onChange={(e) =>
                    setVoucher({ ...voucher, narration: e.target.value })
                  }
                  placeholder="Add any notes or remarks..."
                  className="mt-2"
                />
              </div>

              {/* Total */}
              <div className="flex justify-end mb-8">
                <div className="w-full max-w-md">
                  <div className="bg-muted/30 rounded-lg p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-muted-foreground">
                        Total Amount
                      </span>
                      <span className="text-3xl font-bold text-primary">
                        {formatCurrency(totals.grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={handlePost}
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                >
                  Save Purchase
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Party Dialog */}
        <Dialog open={showAddParty} onOpenChange={setShowAddParty}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Party</DialogTitle>
              <DialogDescription>
                Enter the details of the new party
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Party Name *</Label>
                <Input
                  value={newParty.name}
                  onChange={(e) =>
                    setNewParty({ ...newParty, name: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newParty.name.trim()) {
                      e.preventDefault();
                      const newPartyObj: Party = {
                        id: `PT${String(parties.length + 1).padStart(3, "0")}`,
                        name: newParty.name,
                        contact: newParty.contact,
                        gst: newParty.gst,
                        state: newParty.state,
                      };
                      setParties([...parties, newPartyObj]);
                      setVoucher({ ...voucher, partyLedger: newParty.name });
                      setShowAddParty(false);
                      setNewParty({
                        name: "",
                        contact: "",
                        gst: "",
                        state: "",
                      });
                    }
                  }}
                  placeholder="Enter party name..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Contact Number</Label>
                <Input
                  value={newParty.contact}
                  onChange={(e) =>
                    setNewParty({ ...newParty, contact: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newParty.name.trim()) {
                      e.preventDefault();
                      const newPartyObj: Party = {
                        id: `PT${String(parties.length + 1).padStart(3, "0")}`,
                        name: newParty.name,
                        contact: newParty.contact,
                        gst: newParty.gst,
                        state: newParty.state,
                      };
                      setParties([...parties, newPartyObj]);
                      setVoucher({ ...voucher, partyLedger: newParty.name });
                      setShowAddParty(false);
                      setNewParty({
                        name: "",
                        contact: "",
                        gst: "",
                        state: "",
                      });
                    }
                  }}
                  placeholder="Enter contact number..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>GST Number</Label>
                <Input
                  value={newParty.gst}
                  onChange={(e) =>
                    setNewParty({ ...newParty, gst: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newParty.name.trim()) {
                      e.preventDefault();
                      const newPartyObj: Party = {
                        id: `PT${String(parties.length + 1).padStart(3, "0")}`,
                        name: newParty.name,
                        contact: newParty.contact,
                        gst: newParty.gst,
                        state: newParty.state,
                      };
                      setParties([...parties, newPartyObj]);
                      setVoucher({ ...voucher, partyLedger: newParty.name });
                      setShowAddParty(false);
                      setNewParty({
                        name: "",
                        contact: "",
                        gst: "",
                        state: "",
                      });
                    }
                  }}
                  placeholder="Enter GST number..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>State *</Label>
                <Input
                  value={newParty.state}
                  onChange={(e) =>
                    setNewParty({ ...newParty, state: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newParty.name.trim()) {
                      e.preventDefault();
                      const newPartyObj: Party = {
                        id: `PT${String(parties.length + 1).padStart(3, "0")}`,
                        name: newParty.name,
                        contact: newParty.contact,
                        gst: newParty.gst,
                        state: newParty.state,
                      };
                      setParties([...parties, newPartyObj]);
                      setVoucher({ ...voucher, partyLedger: newParty.name });
                      setShowAddParty(false);
                      setNewParty({
                        name: "",
                        contact: "",
                        gst: "",
                        state: "",
                      });
                    }
                  }}
                  placeholder="Enter state name..."
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddParty(false);
                  setNewParty({ name: "", contact: "", gst: "", state: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (newParty.name.trim()) {
                    // Add to mock parties list
                    const newPartyObj: Party = {
                      id: `PT${String(parties.length + 1).padStart(3, "0")}`,
                      name: newParty.name,
                      contact: newParty.contact,
                      gst: newParty.gst,
                      state: newParty.state,
                    };
                    setParties([...parties, newPartyObj]);
                    setVoucher({ ...voucher, partyLedger: newParty.name });
                    setShowAddParty(false);
                    setNewParty({ name: "", contact: "", gst: "", state: "" });
                  }
                }}
                disabled={!newParty.name.trim()}
              >
                Add Party
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
