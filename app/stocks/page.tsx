"use client";

/**
 * Stock Management Page
 * Main page for managing products, stock, categories, barcodes, and expiry
 * Features action cards for quick access to all stock management functions
 */

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useProducts } from "@/hooks/useProducts";
import { productApi } from "@/lib/api/products";
import { categoryApi, Category } from "@/lib/api/categories";
import { expiryApi } from "@/lib/api/expiry";
import { Product, InventorySummary, NearExpiryProduct } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PackagePlus,
  Edit,
  Package,
  FolderTree,
  Barcode,
  Calendar,
  Search,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ProductListCard } from "./components/ProductListCard";
import { AddProductDialog } from "./components/AddProductDialog";
import { UpdateProductDialog } from "./components/UpdateProductDialog";
import { ManageStockDialog } from "./components/ManageStockDialog";
import { ManageCategoryDialog } from "./components/ManageCategoryDialog";
import { BarcodeQRDialog } from "./components/BarcodeQRDialog";
import { NearExpiryCard } from "./components/NearExpiryCard";

export default function StockManagementPage() {
  // ==================== DATA FETCHING ====================
  const {
    products,
    loading: productsLoading,
    error: productsError,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  // ==================== STATE MANAGEMENT ====================
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [nearExpiryProducts, setNearExpiryProducts] = useState<
    NearExpiryProduct[]
  >([]);

  // Dialog states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showUpdateProduct, setShowUpdateProduct] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showManageStock, setShowManageStock] = useState(false);
  const [showManageCategory, setShowManageCategory] = useState(false);
  const [showBarcodeQR, setShowBarcodeQR] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

  // ==================== DATA LOADING ====================

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryApi.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadExpiryData = async () => {
    try {
      const nearExpiry = await expiryApi.getNearExpiryProducts();
      setNearExpiryProducts(nearExpiry);
    } catch (error) {
      console.error("Failed to load expiry data:", error);
    }
  };

  const loadInventorySummary = async () => {
    try {
      const summaryData = await productApi.getSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to load inventory summary:", error);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      fetchProducts(),
      loadCategories(),
      loadExpiryData(),
      loadInventorySummary(),
    ]);
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== HANDLERS ====================

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowUpdateProduct(true);
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      setShowAddProduct(false);
      setShowUpdateProduct(false);
      setSelectedProduct(null);
      await loadAllData();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product. Please try again.");
    }
  };

  const handleStockAdjustment = (product: Product) => {
    setSelectedProduct(product);
    setShowManageStock(true);
  };

  const handleStockUpdated = async () => {
    setShowManageStock(false);
    setSelectedProduct(null);
    await loadAllData();
  };

  const handleShowBarcode = (product: Product) => {
    setBarcodeProduct(product);
    setShowBarcodeQR(true);
  };

  const handleCategoryUpdated = async () => {
    await loadCategories();
    await fetchProducts();
  };

  // ==================== LOADING & ERROR STATES ====================

  if (productsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading inventory...</span>
        </div>
      </Layout>
    );
  }

  if (productsError) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertDescription>
            Error loading inventory: {productsError.message || "Unknown error"}
          </AlertDescription>
        </Alert>
      </Layout>
    );
  }

  // ==================== RENDER ====================

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stock Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Everything you need to manage products, stock, suppliers and
            reporting in one place.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Add Product */}
          <button
            className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors text-left group"
            onClick={() => setShowAddProduct(true)}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-zinc-700 transition-colors">
                <PackagePlus className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Add Product</h3>
            </div>
          </button>

          {/* Update Product */}
          <button
            className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors text-left group"
            onClick={() => {
              if (products.length > 0) {
                setShowProductSelector(true);
              } else {
                alert("No products available to update");
              }
            }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-zinc-700 transition-colors">
                <Edit className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Update Product</h3>
            </div>
          </button>

          {/* Manage Stock */}
          <button
            className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors text-left group"
            onClick={() => {
              if (products.length > 0) {
                handleStockAdjustment(products[0]);
              } else {
                alert("No products available");
              }
            }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-zinc-700 transition-colors">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Manage Stock</h3>
            </div>
          </button>

          {/* Manage Categories */}
          <button
            className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors text-left group"
            onClick={() => setShowManageCategory(true)}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-zinc-700 transition-colors">
                <FolderTree className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Manage Categories</h3>
            </div>
          </button>

          {/* Barcode & QR */}
          <button
            className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors text-left group"
            onClick={() => {
              if (products.length > 0) {
                handleShowBarcode(products[0]);
              } else {
                alert("No products available");
              }
            }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-zinc-700 transition-colors">
                <Barcode className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Barcode & QR</h3>
            </div>
          </button>

          {/* Near Expiry */}
          <button
            className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors text-left group"
            onClick={() => {
              // Scroll to near expiry section
              document
                .getElementById("near-expiry-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-zinc-700 transition-colors">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Near Expiry</h3>
            </div>
          </button>
        </div>

        {/* Product List Table */}
        <ProductListCard
          products={products}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEdit={handleEditProduct}
          onShowBarcode={handleShowBarcode}
          onStockAction={handleStockAdjustment}
        />

        {/* Near Expiry Section */}
        <div id="near-expiry-section">
          <NearExpiryCard products={nearExpiryProducts} />
        </div>

        {/* Dialogs */}
        <AddProductDialog
          open={showAddProduct}
          onClose={() => setShowAddProduct(false)}
          onSave={handleSaveProduct}
          categories={categories}
        />

        {selectedProduct && (
          <>
            <UpdateProductDialog
              open={showUpdateProduct}
              onClose={() => {
                setShowUpdateProduct(false);
                setSelectedProduct(null);
              }}
              product={selectedProduct}
              onSave={handleSaveProduct}
              categories={categories}
            />

            <ManageStockDialog
              open={showManageStock}
              onClose={() => {
                setShowManageStock(false);
                setSelectedProduct(null);
              }}
              product={selectedProduct}
              onStockUpdated={handleStockUpdated}
            />
          </>
        )}

        <ManageCategoryDialog
          open={showManageCategory}
          onClose={() => setShowManageCategory(false)}
          categories={categories}
          onCategoryUpdated={handleCategoryUpdated}
        />

        {barcodeProduct && (
          <BarcodeQRDialog
            open={showBarcodeQR}
            onClose={() => {
              setShowBarcodeQR(false);
              setBarcodeProduct(null);
            }}
            product={barcodeProduct}
          />
        )}

        {/* Product Selector Dialog */}
        <Dialog
          open={showProductSelector}
          onOpenChange={setShowProductSelector}
        >
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Select Product to Update</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
              <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                {products
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 hover:bg-accent cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        handleEditProduct(product);
                        setShowProductSelector(false);
                        setSearchTerm("");
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.sku} • {product.category} • Stock:{" "}
                          {product.stock} {product.unit}
                        </div>
                      </div>
                      <Badge variant={product.active ? "default" : "secondary"}>
                        ₹{product.sellingPrice.toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                {products.filter(
                  (p) =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No products found
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
