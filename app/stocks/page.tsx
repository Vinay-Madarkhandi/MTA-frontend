"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { productApi } from "@/lib/api/products";
import { categoryApi, Category, Subcategory } from "@/lib/api/categories";
import { expiryApi } from "@/lib/api/expiry";
import QRCode from "qrcode";
import {
  Product,
  InventorySummary,
  NearExpiryProduct,
  ExpiryStats,
  ExpiryAlertThreshold,
} from "@/types";
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
  RefreshCw,
  Plus,
  PackagePlus,
  X,
  Edit,
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FolderTree,
  Trash2,
  Barcode,
  QrCode,
  Printer,
  Download,
  ShoppingCart,
  Calendar,
  Clock,
  Bell,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "motion/react";
import { Textarea } from "@/components/ui/textarea";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockAction, setStockAction] = useState<"add" | "reduce" | null>(null);
  const [stockAmount, setStockAmount] = useState<number>(0);
  const [lowStockAlert, setLowStockAlert] = useState<number>(0);
  const [minimumQty, setMinimumQty] = useState<number>(0);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: "",
    description: "",
    categoryId: 0,
  });

  // Barcode/QR Code state
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedProductForCode, setSelectedProductForCode] =
    useState<Product | null>(null);
  const barcodeRef = useRef<HTMLCanvasElement>(null);
  const qrcodeRef = useRef<HTMLCanvasElement>(null);

  // Expiry Management state
  const [nearExpiryProducts, setNearExpiryProducts] = useState<
    NearExpiryProduct[]
  >([]);
  const [expiryStats, setExpiryStats] = useState<ExpiryStats | null>(null);
  const [alertThresholds, setAlertThresholds] = useState<
    ExpiryAlertThreshold[]
  >([]);
  const [showThresholdSettings, setShowThresholdSettings] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState<
    "all" | "expired" | "near-expiry" | "safe"
  >("all");

  const emptyFormData = {
    name: "",
    category: "Grains",
    brand: "",
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    sku: "",
    unit: "kg",
    supplier: "",
    imageUrl: "",
    active: true,
    lowStockThreshold: 10,
    minimumQuantity: 5,
    expiryDate: "",
    batchNumber: "",
    manufacturingDate: "",
  };

  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    loadData();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryApi.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  // Handle outside click to close expanded card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setExpandedCard(null);
      }
    };

    if (expandedCard) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [expandedCard]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        productsData,
        summaryData,
        nearExpiryData,
        expiryStatsData,
        thresholdsData,
      ] = await Promise.all([
        productApi.getAll(),
        productApi.getSummary(),
        expiryApi.getNearExpiryProducts(),
        expiryApi.getExpiryStats(),
        expiryApi.getAlertThresholds(),
      ]);
      setProducts(productsData);
      setSummary(summaryData);
      setNearExpiryProducts(nearExpiryData);
      setExpiryStats(expiryStatsData);
      setAlertThresholds(thresholdsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        currentStock: formData.stock,
        gstPercent: 0,
        reorderLevel: formData.lowStockThreshold,
      };
      await productApi.create(productData);
      setExpandedCard(null);
      setFormData(emptyFormData);
      loadData();
      alert("Product created successfully!");
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to create product");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const productData = {
        ...formData,
        currentStock: formData.stock,
        gstPercent: 0,
        reorderLevel: formData.lowStockThreshold,
      };
      await productApi.update(selectedProduct.id, productData);
      setExpandedCard(null);
      setSelectedProduct(null);
      setSearchTerm("");
      setFormData(emptyFormData);
      loadData();
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product");
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      sku: product.sku,
      unit: product.unit,
      supplier: product.supplier,
      imageUrl: product.imageUrl || "",
      active: product.active,
      lowStockThreshold: product.lowStockThreshold,
      minimumQuantity: product.minimumQuantity,
      expiryDate: product.expiryDate || "",
      batchNumber: product.batchNumber || "",
      manufacturingDate: product.manufacturingDate || "",
    });
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockManagement = async () => {
    if (!selectedProduct) return;

    try {
      const addStock = stockAction === "add" ? stockAmount : 0;
      const reduceStock = stockAction === "reduce" ? stockAmount : 0;

      await productApi.adjustStock(selectedProduct.id, {
        addStock,
        reduceStock,
      });

      // Update low stock threshold and minimum quantity if changed
      if (
        lowStockAlert !== selectedProduct.lowStockThreshold ||
        minimumQty !== selectedProduct.minimumQuantity
      ) {
        await productApi.update(selectedProduct.id, {
          ...selectedProduct,
          lowStockThreshold: lowStockAlert,
          minimumQuantity: minimumQty,
        });
      }

      setExpandedCard(null);
      setSelectedProduct(null);
      setSearchTerm("");
      setStockAmount(0);
      setStockAction(null);
      loadData();

      const action = stockAction === "add" ? "added to" : "reduced from";
      alert(`Successfully ${action} stock! Stock updated and settings saved.`);
    } catch (error) {
      console.error("Failed to manage stock:", error);
      alert("Failed to update stock. Please try again.");
    }
  };

  const handleSelectProductForStock = (product: Product) => {
    setSelectedProduct(product);
    setLowStockAlert(product.lowStockThreshold);
    setMinimumQty(product.minimumQuantity);
    setStockAmount(0);
    setStockAction(null);
  };

  // Category Management Functions
  const handleCreateCategory = async () => {
    if (!categoryFormData.name.trim()) {
      alert("Category name is required!");
      return;
    }

    try {
      await categoryApi.createCategory(categoryFormData);
      setCategoryFormData({ name: "", description: "" });
      loadCategories();
      alert("Category created successfully!");
    } catch (error) {
      console.error("Failed to create category:", error);
      alert("Failed to create category");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryFormData.name.trim()) return;

    try {
      await categoryApi.updateCategory(editingCategory.id, categoryFormData);
      setEditingCategory(null);
      setCategoryFormData({ name: "", description: "" });
      loadCategories();
      alert("Category updated successfully!");
    } catch (error) {
      console.error("Failed to update category:", error);
      alert("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? All subcategories will also be deleted."
      )
    )
      return;

    try {
      await categoryApi.deleteCategory(id);
      loadCategories();
      alert("Category deleted successfully!");
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category");
    }
  };

  const handleCreateSubcategory = async () => {
    if (!subcategoryFormData.name.trim() || !subcategoryFormData.categoryId) {
      alert("Subcategory name and category selection are required!");
      return;
    }

    try {
      await categoryApi.createSubcategory(subcategoryFormData);
      setSubcategoryFormData({ name: "", description: "", categoryId: 0 });
      loadCategories();
      alert("Subcategory created successfully!");
    } catch (error) {
      console.error("Failed to create subcategory:", error);
      alert("Failed to create subcategory");
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory || !subcategoryFormData.name.trim()) return;

    try {
      await categoryApi.updateSubcategory(
        editingSubcategory.id,
        subcategoryFormData
      );
      setEditingSubcategory(null);
      setSubcategoryFormData({ name: "", description: "", categoryId: 0 });
      loadCategories();
      alert("Subcategory updated successfully!");
    } catch (error) {
      console.error("Failed to update subcategory:", error);
      alert("Failed to update subcategory");
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      await categoryApi.deleteSubcategory(id);
      loadCategories();
      alert("Subcategory deleted successfully!");
    } catch (error) {
      console.error("Failed to delete subcategory:", error);
      alert("Failed to delete subcategory");
    }
  };

  // Barcode/QR Code Functions
  const generateBarcode = (sku: string) => {
    if (!barcodeRef.current) return;

    const canvas = barcodeRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Simple barcode representation (Code 128 style)
    const barcodeWidth = 400;
    const barcodeHeight = 100;
    canvas.width = barcodeWidth;
    canvas.height = barcodeHeight;

    // White background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, barcodeWidth, barcodeHeight);

    // Black bars (simplified pattern based on SKU)
    ctx.fillStyle = "black";
    const barWidth = 3;
    let x = 20;

    // Start pattern
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x, 10, barWidth, 60);
      x += barWidth * 2;
    }

    // Encode SKU characters
    for (let i = 0; i < sku.length; i++) {
      const charCode = sku.charCodeAt(i);
      const pattern = charCode % 10;

      for (let j = 0; j < 4; j++) {
        if ((pattern >> j) & 1) {
          ctx.fillRect(x, 10, barWidth, 60);
        }
        x += barWidth * 2;
      }
    }

    // End pattern
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x, 10, barWidth, 60);
      x += barWidth * 2;
    }

    // SKU text
    ctx.fillStyle = "black";
    ctx.font = "14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(sku, barcodeWidth / 2, 85);
  };

  const generateQRCode = async (sku: string, productName: string) => {
    if (!qrcodeRef.current) return;

    const canvas = qrcodeRef.current;
    const data = JSON.stringify({
      sku,
      name: productName,
      timestamp: new Date().toISOString(),
    });

    try {
      await QRCode.toCanvas(canvas, data, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      });
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  const handlePrintBarcode = () => {
    if (!barcodeRef.current || !qrcodeRef.current || !selectedProductForCode)
      return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const barcodeImage = barcodeRef.current.toDataURL();
    const qrcodeImage = qrcodeRef.current.toDataURL();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Product Labels - ${selectedProductForCode.sku}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .label {
              border: 2px solid #000;
              padding: 20px;
              margin: 20px;
              text-align: center;
              page-break-after: always;
            }
            h2 { margin: 10px 0; }
            .info { margin: 10px 0; font-size: 14px; }
            img { margin: 10px 0; }
            @media print {
              body { padding: 0; }
              .label { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <h2>${selectedProductForCode.name}</h2>
            <div class="info">SKU: ${selectedProductForCode.sku}</div>
            <div class="info">Category: ${selectedProductForCode.category}</div>
            <div class="info">Price: ₹${selectedProductForCode.sellingPrice.toFixed(
              2
            )}</div>
            <img src="${barcodeImage}" alt="Barcode" />
            <div class="info">Barcode</div>
          </div>
          <div class="label">
            <h2>${selectedProductForCode.name}</h2>
            <div class="info">SKU: ${selectedProductForCode.sku}</div>
            <img src="${qrcodeImage}" alt="QR Code" />
            <div class="info">QR Code</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadCodes = () => {
    if (!barcodeRef.current || !qrcodeRef.current || !selectedProductForCode)
      return;

    // Download barcode
    const barcodeUrl = barcodeRef.current.toDataURL("image/png");
    const barcodeLink = document.createElement("a");
    barcodeLink.download = `barcode-${selectedProductForCode.sku}.png`;
    barcodeLink.href = barcodeUrl;
    barcodeLink.click();

    // Download QR code
    setTimeout(() => {
      const qrcodeUrl = qrcodeRef.current!.toDataURL("image/png");
      const qrcodeLink = document.createElement("a");
      qrcodeLink.download = `qrcode-${selectedProductForCode.sku}.png`;
      qrcodeLink.href = qrcodeUrl;
      qrcodeLink.click();
    }, 100);
  };

  const handleProcessPayment = async (productSku: string, quantity: number) => {
    try {
      // Find product by SKU
      const product = products.find((p) => p.sku === productSku);
      if (!product) {
        alert("Product not found with SKU: " + productSku);
        return;
      }

      if (product.stock < quantity) {
        alert(
          `Insufficient stock! Available: ${product.stock}, Requested: ${quantity}`
        );
        return;
      }

      // Deduct stock after payment confirmation
      await productApi.adjustStock(product.id, {
        addStock: 0,
        reduceStock: quantity,
      });

      // Reload data to reflect changes
      await loadData();

      alert(
        `Payment successful! ${quantity} units of ${product.name} sold. Stock updated.`
      );
    } catch (error) {
      console.error("Failed to process payment:", error);
      alert("Failed to process payment and update stock");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productApi.delete(id);
      loadData();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  };

  const getStatusBadge = (product: Product) => {
    const { stock, lowStockThreshold, minimumQuantity } = product;
    const threshold = lowStockThreshold || minimumQuantity || 0;

    if (stock === 0) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
        >
          Out of Stock
        </Badge>
      );
    }
    if (stock <= threshold) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
        >
          Low Stock
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
      >
        In Stock
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Stock Management
          </h1>
          <p className="text-muted-foreground">
            Everything you need to manage products, stock, suppliers and
            reporting in one place.
          </p>
        </header>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {summary.totalProducts}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {summary.inStock}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Low Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {summary.lowStock}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {summary.outOfStock}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modern Card-Based Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Add Product Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="cursor-pointer"
            onClick={() => setExpandedCard("add-product")}
          >
            <Card className="h-full border-2 hover:border-primary/50 transition-colors duration-300 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-24">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                  <PackagePlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-sm">Add Product</h3>
              </CardContent>
            </Card>
          </motion.div>

          {/* Update Product Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="cursor-pointer"
            onClick={() => {
              setExpandedCard("update-product");
              setSelectedProduct(null);
              setSearchTerm("");
            }}
          >
            <Card className="h-full border-2 hover:border-primary/50 transition-colors duration-300 bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-24">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900/50 p-2">
                  <Edit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-sm">Update Product</h3>
              </CardContent>
            </Card>
          </motion.div>

          {/* Manage Stock Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="cursor-pointer"
            onClick={() => {
              setExpandedCard("manage-stock");
              setSelectedProduct(null);
              setSearchTerm("");
              setStockAmount(0);
              setStockAction(null);
            }}
          >
            <Card className="h-full border-2 hover:border-primary/50 transition-colors duration-300 bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-24">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900/50 p-2">
                  <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-sm">Manage Stock</h3>
              </CardContent>
            </Card>
          </motion.div>

          {/* Manage Categories Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="cursor-pointer"
            onClick={() => {
              setExpandedCard("manage-categories");
              setCategoryFormData({ name: "", description: "" });
              setSubcategoryFormData({
                name: "",
                description: "",
                categoryId: 0,
              });
              setEditingCategory(null);
              setEditingSubcategory(null);
            }}
          >
            <Card className="h-full border-2 hover:border-primary/50 transition-colors duration-300 bg-linear-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-24">
                <div className="rounded-full bg-teal-100 dark:bg-teal-900/50 p-2">
                  <FolderTree className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="font-semibold text-sm">Manage Categories</h3>
              </CardContent>
            </Card>
          </motion.div>

          {/* Barcode & QR Code Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="cursor-pointer"
            onClick={() => {
              setExpandedCard("barcode-qrcode");
              setSelectedProductForCode(null);
              setSearchTerm("");
            }}
          >
            <Card className="h-full border-2 hover:border-primary/50 transition-colors duration-300 bg-linear-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-24">
                <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/50 p-2">
                  <QrCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-sm">Barcode & QR</h3>
              </CardContent>
            </Card>
          </motion.div>

          {/* Near-Expiry Products Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="cursor-pointer relative"
            onClick={() => {
              setExpandedCard("near-expiry");
              setExpiryFilter("all");
            }}
          >
            <Card className="h-full border-2 hover:border-primary/50 transition-colors duration-300 bg-linear-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-24">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900/50 p-2">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-sm">Near Expiry</h3>
                {expiryStats &&
                  (expiryStats.expiredCount > 0 ||
                    expiryStats.nearExpiryCount > 0) && (
                    <div className="absolute -top-2 -right-2 flex items-center gap-1">
                      {expiryStats.expiredCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="text-xs px-1.5 py-0.5"
                        >
                          {expiryStats.expiredCount}
                        </Badge>
                      )}
                      {expiryStats.nearExpiryCount > 0 && (
                        <Badge className="text-xs px-1.5 py-0.5 bg-orange-500">
                          {expiryStats.nearExpiryCount}
                        </Badge>
                      )}
                    </div>
                  )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Refresh Inventory Card */}
          {/* <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="cursor-pointer"
            onClick={loadData}
          >
            <Card className="h-full border-2 hover:border-primary/50 transition-colors duration-300 bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-24">
                <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-2">
                  <RefreshCw className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-sm">Refresh Inventory</h3>
              </CardContent>
            </Card>
          </motion.div> */}
        </div>

        {/* Expandable Modal Overlay */}
        <AnimatePresence>
          {expandedCard === "add-product" && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setExpandedCard(null)}
              />

              {/* Expanded Card */}
              <motion.div
                ref={cardRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-hidden"
              >
                <Card className="h-full flex flex-col shadow-2xl border-2">
                  <CardHeader className="border-b bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                          <PackagePlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                          Add New Product
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedCard(null)}
                        className="rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Enter product name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                            className="transition-all focus:scale-[1.01]"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) =>
                              setFormData({ ...formData, category: value })
                            }
                          >
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="brand">Brand / Company</Label>
                          <Input
                            id="brand"
                            type="text"
                            placeholder="Enter brand name"
                            value={formData.brand}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                brand: e.target.value,
                              })
                            }
                            className="transition-all focus:scale-[1.01]"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="sku">SKU / Product Code *</Label>
                          <Input
                            id="sku"
                            type="text"
                            placeholder="Enter SKU"
                            value={formData.sku}
                            onChange={(e) =>
                              setFormData({ ...formData, sku: e.target.value })
                            }
                            required
                            className="transition-all focus:scale-[1.01]"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="purchasePrice">
                            Purchase Price (₹) *
                          </Label>
                          <Input
                            id="purchasePrice"
                            type="number"
                            placeholder="0.00"
                            value={formData.purchasePrice || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                purchasePrice: Number(e.target.value),
                              })
                            }
                            step="0.01"
                            required
                            className="transition-all focus:scale-[1.01]"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="sellingPrice">
                            Selling Price (₹) *
                          </Label>
                          <Input
                            id="sellingPrice"
                            type="number"
                            placeholder="0.00"
                            value={formData.sellingPrice || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                sellingPrice: Number(e.target.value),
                              })
                            }
                            step="0.01"
                            required
                            className="transition-all focus:scale-[1.01]"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="stock">Stock Quantity *</Label>
                          <Input
                            id="stock"
                            type="number"
                            placeholder="Enter quantity"
                            value={formData.stock || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                stock: Number(e.target.value),
                              })
                            }
                            required
                            className="transition-all focus:scale-[1.01]"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="unit">Unit</Label>
                          <Input
                            id="unit"
                            type="text"
                            placeholder="kg, pcs, box"
                            value={formData.unit}
                            onChange={(e) =>
                              setFormData({ ...formData, unit: e.target.value })
                            }
                            className="transition-all focus:scale-[1.01]"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="supplier">Supplier Name</Label>
                          <Input
                            id="supplier"
                            type="text"
                            placeholder="Enter supplier name"
                            value={formData.supplier}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                supplier: e.target.value,
                              })
                            }
                            className="transition-all focus:scale-[1.01]"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 }}
                          className="space-y-2 md:col-span-2"
                        >
                          <Label htmlFor="imageUrl">Image URL</Label>
                          <Input
                            id="imageUrl"
                            type="text"
                            placeholder="Enter image URL"
                            value={formData.imageUrl}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                imageUrl: e.target.value,
                              })
                            }
                            className="transition-all focus:scale-[1.01]"
                          />
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex gap-4 pt-4 border-t"
                      >
                        <Button
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Product
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setExpandedCard(null)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {/* Update Product Modal */}
          {expandedCard === "update-product" && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => {
                  setExpandedCard(null);
                  setSelectedProduct(null);
                  setSearchTerm("");
                }}
              />

              {/* Expanded Card */}
              <motion.div
                ref={cardRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-hidden"
              >
                <Card className="h-full flex flex-col shadow-2xl border-2">
                  <CardHeader className="border-b bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-purple-100 dark:bg-purple-900/50 p-2">
                          <Edit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                          Update Existing Product
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setExpandedCard(null);
                          setSelectedProduct(null);
                          setSearchTerm("");
                        }}
                        className="rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6">
                    {!selectedProduct ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="search">Search Product</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="search"
                              type="text"
                              placeholder="Search by name, SKU, or category..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                          <div className="max-h-[500px] overflow-y-auto">
                            {filteredProducts.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                {searchTerm
                                  ? "No products found matching your search"
                                  : "No products available"}
                              </div>
                            ) : (
                              <div className="divide-y">
                                {filteredProducts.map((product) => (
                                  <motion.div
                                    key={product.id}
                                    whileHover={{
                                      backgroundColor: "rgba(0,0,0,0.02)",
                                    }}
                                    className="p-4 cursor-pointer transition-colors dark:hover:bg-white/5"
                                    onClick={() => handleSelectProduct(product)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-lg">
                                          {product.name}
                                        </h4>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                          <span>SKU: {product.sku}</span>
                                          <span>
                                            Category: {product.category}
                                          </span>
                                          <span>
                                            Stock: {product.stock}{" "}
                                            {product.unit}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <p className="font-semibold">
                                            ₹{product.sellingPrice.toFixed(2)}
                                          </p>
                                        </div>
                                        {getStatusBadge(product)}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Updating Product
                              </p>
                              <p className="font-semibold text-lg">
                                {selectedProduct.name}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(null);
                                setSearchTerm("");
                              }}
                            >
                              Change Product
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="update-name">Product Name *</Label>
                            <Input
                              id="update-name"
                              type="text"
                              placeholder="Enter product name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              required
                              className="transition-all focus:scale-[1.01]"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="update-category">Category *</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) =>
                                setFormData({ ...formData, category: value })
                              }
                            >
                              <SelectTrigger id="update-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="update-brand">
                              Brand / Company
                            </Label>
                            <Input
                              id="update-brand"
                              type="text"
                              placeholder="Enter brand name"
                              value={formData.brand}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  brand: e.target.value,
                                })
                              }
                              className="transition-all focus:scale-[1.01]"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="update-sku">
                              SKU / Product Code *
                            </Label>
                            <Input
                              id="update-sku"
                              type="text"
                              placeholder="Enter SKU"
                              value={formData.sku}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  sku: e.target.value,
                                })
                              }
                              required
                              className="transition-all focus:scale-[1.01]"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="update-purchasePrice">
                              Purchase Price (₹) *
                            </Label>
                            <Input
                              id="update-purchasePrice"
                              type="number"
                              placeholder="0.00"
                              value={formData.purchasePrice || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  purchasePrice: Number(e.target.value),
                                })
                              }
                              step="0.01"
                              required
                              className="transition-all focus:scale-[1.01]"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="update-sellingPrice">
                              Selling Price (₹) *
                            </Label>
                            <Input
                              id="update-sellingPrice"
                              type="number"
                              placeholder="0.00"
                              value={formData.sellingPrice || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  sellingPrice: Number(e.target.value),
                                })
                              }
                              step="0.01"
                              required
                              className="transition-all focus:scale-[1.01]"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="update-stock">
                              Stock Quantity *
                            </Label>
                            <Input
                              id="update-stock"
                              type="number"
                              placeholder="Enter quantity"
                              value={formData.stock || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  stock: Number(e.target.value),
                                })
                              }
                              required
                              className="transition-all focus:scale-[1.01]"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="update-unit">Unit</Label>
                            <Input
                              id="update-unit"
                              type="text"
                              placeholder="kg, pcs, box"
                              value={formData.unit}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  unit: e.target.value,
                                })
                              }
                              className="transition-all focus:scale-[1.01]"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="update-supplier">
                              Supplier Name
                            </Label>
                            <Input
                              id="update-supplier"
                              type="text"
                              placeholder="Enter supplier name"
                              value={formData.supplier}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  supplier: e.target.value,
                                })
                              }
                              className="transition-all focus:scale-[1.01]"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                            className="space-y-2 md:col-span-2"
                          >
                            <Label htmlFor="update-imageUrl">Image URL</Label>
                            <Input
                              id="update-imageUrl"
                              type="text"
                              placeholder="Enter image URL"
                              value={formData.imageUrl}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  imageUrl: e.target.value,
                                })
                              }
                              className="transition-all focus:scale-[1.01]"
                            />
                          </motion.div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="flex gap-4 pt-4 border-t"
                        >
                          <Button
                            type="submit"
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Update Product
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setExpandedCard(null);
                              setSelectedProduct(null);
                              setSearchTerm("");
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </motion.div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {/* Manage Stock Modal */}
          {expandedCard === "manage-stock" && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => {
                  setExpandedCard(null);
                  setSelectedProduct(null);
                  setSearchTerm("");
                  setStockAmount(0);
                  setStockAction(null);
                }}
              />

              {/* Expanded Card */}
              <motion.div
                ref={cardRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-hidden"
              >
                <Card className="h-full flex flex-col shadow-2xl border-2">
                  <CardHeader className="border-b bg-linear-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-orange-100 dark:bg-orange-900/50 p-2">
                          <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                          Manage Stock
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setExpandedCard(null);
                          setSelectedProduct(null);
                          setSearchTerm("");
                          setStockAmount(0);
                          setStockAction(null);
                        }}
                        className="rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6">
                    {!selectedProduct ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="search-stock">Search Product</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="search-stock"
                              type="text"
                              placeholder="Search by name, SKU, or category..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                          <div className="max-h-[500px] overflow-y-auto">
                            {filteredProducts.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                {searchTerm
                                  ? "No products found matching your search"
                                  : "No products available"}
                              </div>
                            ) : (
                              <div className="divide-y">
                                {filteredProducts.map((product) => (
                                  <motion.div
                                    key={product.id}
                                    whileHover={{
                                      backgroundColor: "rgba(0,0,0,0.02)",
                                    }}
                                    className="p-4 cursor-pointer transition-colors dark:hover:bg-white/5"
                                    onClick={() =>
                                      handleSelectProductForStock(product)
                                    }
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-lg">
                                          {product.name}
                                        </h4>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                          <span>SKU: {product.sku}</span>
                                          <span>
                                            Category: {product.category}
                                          </span>
                                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                                            Current Stock: {product.stock}{" "}
                                            {product.unit}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        {getStatusBadge(product)}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Managing Stock For
                              </p>
                              <p className="font-semibold text-xl">
                                {selectedProduct.name}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                SKU: {selectedProduct.sku}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(null);
                                setSearchTerm("");
                                setStockAmount(0);
                                setStockAction(null);
                              }}
                            >
                              Change Product
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Current Stock
                              </p>
                              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {selectedProduct.stock} {selectedProduct.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Status
                              </p>
                              <div className="mt-1">
                                {getStatusBadge(selectedProduct)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stock Actions */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="space-y-3"
                        >
                          <Label className="text-base font-semibold">
                            Stock Actions
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setStockAction("add")}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                stockAction === "add"
                                  ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                                  : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                              }`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className={`rounded-full p-2 ${
                                    stockAction === "add"
                                      ? "bg-green-100 dark:bg-green-900/50"
                                      : "bg-gray-100 dark:bg-gray-800"
                                  }`}
                                >
                                  <TrendingUp
                                    className={`h-5 w-5 ${
                                      stockAction === "add"
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-gray-600 dark:text-gray-400"
                                    }`}
                                  />
                                </div>
                                <span
                                  className={`font-semibold ${
                                    stockAction === "add"
                                      ? "text-green-700 dark:text-green-400"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  Add Stock
                                </span>
                              </div>
                            </motion.button>

                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setStockAction("reduce")}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                stockAction === "reduce"
                                  ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                                  : "border-gray-200 dark:border-gray-700 hover:border-red-300"
                              }`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className={`rounded-full p-2 ${
                                    stockAction === "reduce"
                                      ? "bg-red-100 dark:bg-red-900/50"
                                      : "bg-gray-100 dark:bg-gray-800"
                                  }`}
                                >
                                  <TrendingDown
                                    className={`h-5 w-5 ${
                                      stockAction === "reduce"
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-gray-600 dark:text-gray-400"
                                    }`}
                                  />
                                </div>
                                <span
                                  className={`font-semibold ${
                                    stockAction === "reduce"
                                      ? "text-red-700 dark:text-red-400"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  Reduce Stock
                                </span>
                              </div>
                            </motion.button>
                          </div>
                        </motion.div>

                        {/* Stock Amount Input */}
                        {stockAction && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="stock-amount">
                              {stockAction === "add"
                                ? "Quantity to Add"
                                : "Quantity to Reduce"}{" "}
                              *
                            </Label>
                            <Input
                              id="stock-amount"
                              type="number"
                              placeholder="Enter quantity"
                              value={stockAmount || ""}
                              onChange={(e) =>
                                setStockAmount(Number(e.target.value))
                              }
                              min="0"
                              className="text-lg font-semibold"
                            />
                            {stockAmount > 0 && (
                              <p className="text-sm text-muted-foreground">
                                New stock will be:{" "}
                                <span className="font-semibold text-orange-600 dark:text-orange-400">
                                  {stockAction === "add"
                                    ? selectedProduct.stock + stockAmount
                                    : selectedProduct.stock - stockAmount}{" "}
                                  {selectedProduct.unit}
                                </span>
                              </p>
                            )}
                          </motion.div>
                        )}

                        {/* Alert Settings */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="space-y-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <Label className="text-base font-semibold">
                              Alert Settings
                            </Label>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="low-stock-alert">
                                Low Stock Threshold
                              </Label>
                              <Input
                                id="low-stock-alert"
                                type="number"
                                placeholder="Low stock threshold"
                                value={lowStockAlert || ""}
                                onChange={(e) =>
                                  setLowStockAlert(Number(e.target.value))
                                }
                                min="0"
                              />
                              <p className="text-xs text-muted-foreground">
                                Alert when stock falls below this number
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="minimum-qty">
                                Minimum Quantity
                              </Label>
                              <Input
                                id="minimum-qty"
                                type="number"
                                placeholder="Minimum quantity"
                                value={minimumQty || ""}
                                onChange={(e) =>
                                  setMinimumQty(Number(e.target.value))
                                }
                                min="0"
                              />
                              <p className="text-xs text-muted-foreground">
                                Minimum stock to maintain
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex gap-4 pt-4 border-t"
                        >
                          <Button
                            type="button"
                            onClick={handleStockManagement}
                            disabled={!stockAction || stockAmount <= 0}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            {stockAction === "add"
                              ? "Add Stock"
                              : stockAction === "reduce"
                              ? "Reduce Stock"
                              : "Update Stock"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setExpandedCard(null);
                              setSelectedProduct(null);
                              setSearchTerm("");
                              setStockAmount(0);
                              setStockAction(null);
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {/* Manage Categories Modal */}
          {expandedCard === "manage-categories" && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => {
                  setExpandedCard(null);
                  setCategoryFormData({ name: "", description: "" });
                  setSubcategoryFormData({
                    name: "",
                    description: "",
                    categoryId: 0,
                  });
                  setEditingCategory(null);
                  setEditingSubcategory(null);
                }}
              />

              {/* Expanded Card */}
              <motion.div
                ref={cardRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-hidden"
              >
                <Card className="h-full flex flex-col shadow-2xl border-2">
                  <CardHeader className="border-b bg-linear-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/50 p-2">
                          <FolderTree className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                          Manage Categories & Subcategories
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setExpandedCard(null);
                          setCategoryFormData({ name: "", description: "" });
                          setSubcategoryFormData({
                            name: "",
                            description: "",
                            categoryId: 0,
                          });
                          setEditingCategory(null);
                          setEditingSubcategory(null);
                        }}
                        className="rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Categories Section */}
                      <div className="space-y-4">
                        <div className="bg-teal-50 dark:bg-teal-950/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <FolderTree className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            {editingCategory
                              ? "Edit Category"
                              : "Add New Category"}
                          </h3>

                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="cat-name">Category Name *</Label>
                              <Input
                                id="cat-name"
                                type="text"
                                placeholder="Enter category name"
                                value={categoryFormData.name}
                                onChange={(e) =>
                                  setCategoryFormData({
                                    ...categoryFormData,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cat-desc">Description</Label>
                              <Textarea
                                id="cat-desc"
                                placeholder="Enter category description"
                                value={categoryFormData.description}
                                onChange={(e) =>
                                  setCategoryFormData({
                                    ...categoryFormData,
                                    description: e.target.value,
                                  })
                                }
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              {editingCategory ? (
                                <>
                                  <Button
                                    type="button"
                                    onClick={handleUpdateCategory}
                                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update Category
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingCategory(null);
                                      setCategoryFormData({
                                        name: "",
                                        description: "",
                                      });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  type="button"
                                  onClick={handleCreateCategory}
                                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Category
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Categories List */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 dark:bg-gray-900 p-3 border-b">
                            <h4 className="font-semibold">
                              Existing Categories
                            </h4>
                          </div>
                          <div className="max-h-[400px] overflow-y-auto divide-y">
                            {categories.length === 0 ? (
                              <div className="p-4 text-center text-muted-foreground">
                                No categories yet
                              </div>
                            ) : (
                              categories.map((category) => (
                                <motion.div
                                  key={category.id}
                                  whileHover={{
                                    backgroundColor: "rgba(0,0,0,0.02)",
                                  }}
                                  className="p-4 dark:hover:bg-white/5"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-base">
                                        {category.name}
                                      </h5>
                                      {category.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {category.description}
                                        </p>
                                      )}
                                      {category.subcategories &&
                                        category.subcategories.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {category.subcategories.map(
                                              (sub) => (
                                                <Badge
                                                  key={sub.id}
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  {sub.name}
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingCategory(category);
                                          setCategoryFormData({
                                            name: category.name,
                                            description:
                                              category.description || "",
                                          });
                                        }}
                                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteCategory(category.id)
                                        }
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Subcategories Section */}
                      <div className="space-y-4">
                        <div className="bg-cyan-50 dark:bg-cyan-950/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
                          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <FolderTree className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                            {editingSubcategory
                              ? "Edit Subcategory"
                              : "Add New Subcategory"}
                          </h3>

                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="subcat-category">
                                Parent Category *
                              </Label>
                              <Select
                                value={subcategoryFormData.categoryId.toString()}
                                onValueChange={(value) =>
                                  setSubcategoryFormData({
                                    ...subcategoryFormData,
                                    categoryId: Number(value),
                                  })
                                }
                              >
                                <SelectTrigger id="subcat-category">
                                  <SelectValue placeholder="Select parent category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem
                                      key={cat.id}
                                      value={cat.id.toString()}
                                    >
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="subcat-name">
                                Subcategory Name *
                              </Label>
                              <Input
                                id="subcat-name"
                                type="text"
                                placeholder="Enter subcategory name"
                                value={subcategoryFormData.name}
                                onChange={(e) =>
                                  setSubcategoryFormData({
                                    ...subcategoryFormData,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="subcat-desc">Description</Label>
                              <Textarea
                                id="subcat-desc"
                                placeholder="Enter subcategory description"
                                value={subcategoryFormData.description}
                                onChange={(e) =>
                                  setSubcategoryFormData({
                                    ...subcategoryFormData,
                                    description: e.target.value,
                                  })
                                }
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              {editingSubcategory ? (
                                <>
                                  <Button
                                    type="button"
                                    onClick={handleUpdateSubcategory}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update Subcategory
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingSubcategory(null);
                                      setSubcategoryFormData({
                                        name: "",
                                        description: "",
                                        categoryId: 0,
                                      });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  type="button"
                                  onClick={handleCreateSubcategory}
                                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Subcategory
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Subcategories List */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 dark:bg-gray-900 p-3 border-b">
                            <h4 className="font-semibold">All Subcategories</h4>
                          </div>
                          <div className="max-h-[400px] overflow-y-auto divide-y">
                            {categories.flatMap((c) => c.subcategories || [])
                              .length === 0 ? (
                              <div className="p-4 text-center text-muted-foreground">
                                No subcategories yet
                              </div>
                            ) : (
                              categories.map((category) =>
                                category.subcategories?.map((subcategory) => (
                                  <motion.div
                                    key={subcategory.id}
                                    whileHover={{
                                      backgroundColor: "rgba(0,0,0,0.02)",
                                    }}
                                    className="p-4 dark:hover:bg-white/5"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-base">
                                          {subcategory.name}
                                        </h5>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          Parent: {category.name}
                                        </p>
                                        {subcategory.description && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {subcategory.description}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex gap-2 ml-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingSubcategory(subcategory);
                                            setSubcategoryFormData({
                                              name: subcategory.name,
                                              description:
                                                subcategory.description || "",
                                              categoryId:
                                                subcategory.categoryId,
                                            });
                                          }}
                                          className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteSubcategory(
                                              subcategory.id
                                            )
                                          }
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {/* Barcode & QR Code Modal */}
          {expandedCard === "barcode-qrcode" && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => {
                  setExpandedCard(null);
                  setSelectedProductForCode(null);
                  setSearchTerm("");
                }}
              />

              {/* Expanded Card */}
              <motion.div
                ref={cardRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-hidden"
              >
                <Card className="h-full flex flex-col shadow-2xl border-2">
                  <CardHeader className="border-b bg-linear-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/50 p-2">
                          <QrCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                          Barcode & QR Code Generator
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setExpandedCard(null);
                          setSelectedProductForCode(null);
                          setSearchTerm("");
                        }}
                        className="rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6">
                    {!selectedProductForCode ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="search-barcode">Search Product</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="search-barcode"
                              type="text"
                              placeholder="Search by name, SKU, or category..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                          <div className="max-h-[500px] overflow-y-auto">
                            {filteredProducts.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                {searchTerm
                                  ? "No products found matching your search"
                                  : "No products available"}
                              </div>
                            ) : (
                              <div className="divide-y">
                                {filteredProducts.map((product) => (
                                  <motion.div
                                    key={product.id}
                                    whileHover={{
                                      backgroundColor: "rgba(0,0,0,0.02)",
                                    }}
                                    className="p-4 cursor-pointer transition-colors dark:hover:bg-white/5"
                                    onClick={() => {
                                      setSelectedProductForCode(product);
                                      setTimeout(() => {
                                        generateBarcode(product.sku);
                                        generateQRCode(
                                          product.sku,
                                          product.name
                                        );
                                      }, 100);
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-lg">
                                          {product.name}
                                        </h4>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                            SKU: {product.sku}
                                          </span>
                                          <span>
                                            Category: {product.category}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <p className="font-semibold">
                                            ₹{product.sellingPrice.toFixed(2)}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            Stock: {product.stock}{" "}
                                            {product.unit}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Generating Codes For
                              </p>
                              <p className="font-semibold text-xl">
                                {selectedProductForCode.name}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1 font-mono">
                                SKU: {selectedProductForCode.sku}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProductForCode(null);
                                setSearchTerm("");
                              }}
                            >
                              Change Product
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Category
                              </p>
                              <p className="font-semibold">
                                {selectedProductForCode.category}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Price
                              </p>
                              <p className="font-semibold">
                                ₹
                                {selectedProductForCode.sellingPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Generated Codes Display */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Barcode */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-3"
                          >
                            <div className="border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-6 bg-white dark:bg-gray-900">
                              <div className="flex items-center gap-2 mb-4">
                                <Barcode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-semibold text-lg">
                                  Barcode
                                </h3>
                              </div>
                              <div className="flex justify-center">
                                <canvas
                                  ref={barcodeRef}
                                  className="border rounded"
                                />
                              </div>
                            </div>
                          </motion.div>

                          {/* QR Code */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-3"
                          >
                            <div className="border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-6 bg-white dark:bg-gray-900">
                              <div className="flex items-center gap-2 mb-4">
                                <QrCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-semibold text-lg">
                                  QR Code
                                </h3>
                              </div>
                              <div className="flex justify-center">
                                <canvas
                                  ref={qrcodeRef}
                                  className="border rounded"
                                />
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Actions */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex gap-4 pt-4 border-t"
                        >
                          <Button
                            type="button"
                            onClick={handlePrintBarcode}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print Labels
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleDownloadCodes}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Images
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setExpandedCard(null);
                              setSelectedProductForCode(null);
                              setSearchTerm("");
                            }}
                          >
                            Close
                          </Button>
                        </motion.div>

                        {/* Payment Processing Section */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <h3 className="font-semibold text-lg">
                              Process Sale
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Scan barcode/QR code at checkout to automatically
                            deduct stock after payment
                          </p>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Quantity"
                              min="1"
                              max={selectedProductForCode.stock}
                              className="w-32"
                              id="sale-quantity"
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                const qtyInput = document.getElementById(
                                  "sale-quantity"
                                ) as HTMLInputElement;
                                const quantity = parseInt(
                                  qtyInput?.value || "0"
                                );
                                if (quantity > 0) {
                                  handleProcessPayment(
                                    selectedProductForCode.sku,
                                    quantity
                                  );
                                } else {
                                  alert("Please enter a valid quantity");
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Complete Sale
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Available stock: {selectedProductForCode.stock}{" "}
                            {selectedProductForCode.unit}
                          </p>
                        </motion.div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {/* Near-Expiry Products Modal */}
          {expandedCard === "near-expiry" && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setExpandedCard(null)}
              />

              {/* Expanded Card */}
              <motion.div
                ref={cardRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-hidden"
              >
                <Card className="h-full flex flex-col shadow-2xl border-2">
                  <CardHeader className="border-b bg-linear-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-orange-100 dark:bg-orange-900/50 p-2">
                          <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold">
                            Product Expiry Management
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Track and manage product expiration dates
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setShowThresholdSettings(!showThresholdSettings)
                          }
                        >
                          <Bell className="h-4 w-4 mr-2" />
                          Alert Settings
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExpandedCard(null)}
                          className="rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6">
                    {/* Stats Cards */}
                    {expiryStats && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="border-red-200 dark:border-red-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Expired
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                  {expiryStats.expiredCount}
                                </p>
                              </div>
                              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-orange-200 dark:border-orange-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Near Expiry
                                </p>
                                <p className="text-2xl font-bold text-orange-600">
                                  {expiryStats.nearExpiryCount}
                                </p>
                              </div>
                              <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3">
                                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 dark:border-blue-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Total Tracked
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                  {expiryStats.totalWithExpiry}
                                </p>
                              </div>
                              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-purple-200 dark:border-purple-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Expired Value
                                </p>
                                <p className="text-2xl font-bold text-purple-600">
                                  ₹{expiryStats.expiryValue.toFixed(0)}
                                </p>
                              </div>
                              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                                <TrendingDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Alert Threshold Settings */}
                    {showThresholdSettings && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                      >
                        <Card className="border-2 border-orange-200 dark:border-orange-800">
                          <CardHeader>
                            <CardTitle className="text-lg">
                              Alert Thresholds Configuration
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Configure when to receive alerts for products
                              approaching expiry
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {alertThresholds.map((threshold) => (
                              <div
                                key={threshold.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: threshold.color }}
                                  />
                                  <div>
                                    <p className="font-semibold">
                                      {threshold.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Alert {threshold.days} days before expiry
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <Input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={threshold.days}
                                    onChange={(e) => {
                                      const updated = alertThresholds.map((t) =>
                                        t.id === threshold.id
                                          ? {
                                              ...t,
                                              days:
                                                parseInt(e.target.value) || 1,
                                            }
                                          : t
                                      );
                                      setAlertThresholds(updated);
                                      expiryApi.updateAlertThreshold({
                                        ...threshold,
                                        days: parseInt(e.target.value) || 1,
                                      });
                                    }}
                                    className="w-20"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const updated = alertThresholds.map((t) =>
                                        t.id === threshold.id
                                          ? { ...t, enabled: !t.enabled }
                                          : t
                                      );
                                      setAlertThresholds(updated);
                                      expiryApi.updateAlertThreshold({
                                        ...threshold,
                                        enabled: !threshold.enabled,
                                      });
                                      loadData();
                                    }}
                                  >
                                    {threshold.enabled ? "Disable" : "Enable"}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {/* Filter Buttons */}
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        variant={expiryFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setExpiryFilter("all")}
                      >
                        All ({nearExpiryProducts.length})
                      </Button>
                      <Button
                        variant={
                          expiryFilter === "expired" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setExpiryFilter("expired")}
                        className={
                          expiryFilter === "expired" ? "bg-red-600" : ""
                        }
                      >
                        Expired (
                        {
                          nearExpiryProducts.filter(
                            (p) => p.expiryStatus === "EXPIRED"
                          ).length
                        }
                        )
                      </Button>
                      <Button
                        variant={
                          expiryFilter === "near-expiry" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setExpiryFilter("near-expiry")}
                        className={
                          expiryFilter === "near-expiry" ? "bg-orange-600" : ""
                        }
                      >
                        Near Expiry (
                        {
                          nearExpiryProducts.filter(
                            (p) => p.expiryStatus === "NEAR_EXPIRY"
                          ).length
                        }
                        )
                      </Button>
                      <Button
                        variant={
                          expiryFilter === "safe" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setExpiryFilter("safe")}
                        className={
                          expiryFilter === "safe" ? "bg-green-600" : ""
                        }
                      >
                        Safe (
                        {
                          nearExpiryProducts.filter(
                            (p) => p.expiryStatus === "SAFE"
                          ).length
                        }
                        )
                      </Button>
                    </div>

                    {/* Products List */}
                    <div className="space-y-3">
                      {nearExpiryProducts
                        .filter((p) => {
                          if (expiryFilter === "all") return true;
                          return (
                            p.expiryStatus ===
                            expiryFilter.toUpperCase().replace("-", "_")
                          );
                        })
                        .map((product) => {
                          const isExpired = product.daysUntilExpiry < 0;
                          const daysText = Math.abs(product.daysUntilExpiry);

                          let bgColor =
                            "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
                          let textColor = "text-green-600 dark:text-green-400";
                          let badgeColor = "bg-green-500";

                          if (isExpired) {
                            bgColor =
                              "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
                            textColor = "text-red-600 dark:text-red-400";
                            badgeColor = "bg-red-500";
                          } else if (product.alertLevel === "CRITICAL") {
                            bgColor =
                              "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
                            textColor = "text-red-600 dark:text-red-400";
                            badgeColor = "bg-red-500";
                          } else if (product.alertLevel === "WARNING") {
                            bgColor =
                              "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800";
                            textColor = "text-orange-600 dark:text-orange-400";
                            badgeColor = "bg-orange-500";
                          } else if (product.alertLevel === "INFO") {
                            bgColor =
                              "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800";
                            textColor = "text-yellow-600 dark:text-yellow-400";
                            badgeColor = "bg-yellow-500";
                          }

                          return (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-4 border-2 rounded-lg ${bgColor}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-lg">
                                      {product.name}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {product.sku}
                                    </Badge>
                                    {product.batchNumber && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Batch: {product.batchNumber}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">
                                        Category
                                      </p>
                                      <p className="font-medium">
                                        {product.category}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">
                                        Stock
                                      </p>
                                      <p className="font-medium">
                                        {product.stock} {product.unit}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">
                                        Expiry Date
                                      </p>
                                      <p className="font-medium">
                                        {new Date(
                                          product.expiryDate!
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">
                                        Value
                                      </p>
                                      <p className="font-medium">
                                        ₹
                                        {(
                                          product.stock * product.sellingPrice
                                        ).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge className={badgeColor}>
                                    {isExpired
                                      ? `Expired ${daysText} ${
                                          daysText === 1 ? "day" : "days"
                                        } ago`
                                      : `${daysText} ${
                                          daysText === 1 ? "day" : "days"
                                        } left`}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <AlertTriangle
                                      className={`h-4 w-4 ${textColor}`}
                                    />
                                    <span
                                      className={`text-sm font-semibold ${textColor}`}
                                    >
                                      {product.alertLevel}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}

                      {nearExpiryProducts.filter((p) => {
                        if (expiryFilter === "all") return true;
                        return (
                          p.expiryStatus ===
                          expiryFilter.toUpperCase().replace("-", "_")
                        );
                      }).length === 0 && (
                        <div className="text-center py-12">
                          <Calendar className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground mt-4">
                            No products in this category
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Products Table */}
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">
                    Product
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Category
                  </TableHead>
                  <TableHead className="text-muted-foreground">Price</TableHead>
                  <TableHead className="text-muted-foreground">Stock</TableHead>
                  <TableHead className="text-muted-foreground">Value</TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No products yet. Click "Add Product" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {product.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {product.sku}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {product.category}
                      </TableCell>
                      <TableCell className="text-foreground">
                        ₹{product.sellingPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {product.stock} {product.unit}
                      </TableCell>
                      <TableCell className="text-foreground">
                        ₹{(product.sellingPrice * product.stock).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(product)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
