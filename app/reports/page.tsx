"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { productApi } from "@/lib/api/products";
import { salesApi } from "@/lib/api/sales";
import { purchaseApi } from "@/lib/api/purchases";
import { customerApi } from "@/lib/api/customers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Package,
  AlertTriangle,
  TrendingUp,
  Users,
  RefreshCw,
  Loader2,
} from "lucide-react";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const generateSalesReport = async () => {
    setLoading(true);
    setActiveReport("sales");
    try {
      const [sales, stats] = await Promise.all([
        salesApi.getAllSales(),
        salesApi.getSalesStats(),
      ]);
      setReportData({ sales, stats });
    } catch (error) {
      console.error("Failed to load sales report:", error);
      alert("Failed to generate sales report");
    } finally {
      setLoading(false);
    }
  };

  const generateInventoryReport = async () => {
    setLoading(true);
    setActiveReport("inventory");
    try {
      const [products, summary] = await Promise.all([
        productApi.getAll(),
        productApi.getSummary(),
      ]);
      setReportData({ products, summary });
    } catch (error) {
      console.error("Failed to load inventory report:", error);
      alert("Failed to generate inventory report");
    } finally {
      setLoading(false);
    }
  };

  const generateLowStockReport = async () => {
    setLoading(true);
    setActiveReport("lowstock");
    try {
      const products = await productApi.getAll();
      const lowStock = products.filter(p => p.stock <= (p.lowStockThreshold || 10));
      setReportData({ lowStock });
    } catch (error) {
      console.error("Failed to load low stock report:", error);
      alert("Failed to generate low stock report");
    } finally {
      setLoading(false);
    }
  };

  const generateCustomerReport = async () => {
    setLoading(true);
    setActiveReport("customer");
    try {
      const [customers, stats] = await Promise.all([
        customerApi.getAll(),
        customerApi.getStats(),
      ]);
      setReportData({ customers, stats });
    } catch (error) {
      console.error("Failed to load customer report:", error);
      alert("Failed to generate customer report");
    } finally {
      setLoading(false);
    }
  };

  const generatePurchaseReport = async () => {
    setLoading(true);
    setActiveReport("purchase");
    try {
      const purchases = await purchaseApi.getAllPurchases();
      setReportData({ purchases });
    } catch (error) {
      console.error("Failed to load purchase report:", error);
      alert("Failed to generate purchase report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Get insights into your business performance
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Sales Report</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Daily, weekly, and monthly sales analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={generateSalesReport}
                disabled={loading}
              >
                {loading && activeReport === "sales" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Inventory Report</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Stock levels and product performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={generateInventoryReport}
                disabled={loading}
              >
                {loading && activeReport === "inventory" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Low Stock Report</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Products running low on inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={generateLowStockReport}
                disabled={loading}
              >
                {loading && activeReport === "lowstock" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Customer Report</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Top customers and buying patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={generateCustomerReport}
                disabled={loading}
              >
                {loading && activeReport === "customer" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <RefreshCw className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Purchase Report</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Track all purchase transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={generatePurchaseReport}
                disabled={loading}
              >
                {loading && activeReport === "purchase" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Report Display */}
        {reportData && (
          <Card>
            <CardHeader>
              <CardTitle>
                {activeReport === "sales" && "Sales Report"}
                {activeReport === "inventory" && "Inventory Report"}
                {activeReport === "lowstock" && "Low Stock Report"}
                {activeReport === "customer" && "Customer Report"}
                {activeReport === "purchase" && "Purchase Report"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Sales Report */}
              {activeReport === "sales" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Sales</p>
                      <p className="text-2xl font-bold">
                        ₹{reportData.stats?.totalSales?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                      <p className="text-2xl font-bold">
                        {reportData.stats?.totalTransactions || 0}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Paid Transactions</p>
                      <p className="text-2xl font-bold text-green-600">
                        {reportData.stats?.paidTransactions || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Recent Sales</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Voucher No</TableHead>
                          <TableHead>Party</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.sales?.slice(0, 10).map((sale: any) => (
                          <TableRow key={sale.id}>
                            <TableCell>{sale.voucherNo}</TableCell>
                            <TableCell>{sale.partyName}</TableCell>
                            <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                            <TableCell>₹{sale.grandTotal?.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                sale.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {sale.paymentStatus}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Inventory Report */}
              {activeReport === "inventory" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Products</p>
                      <p className="text-2xl font-bold">{reportData.summary?.totalProducts || 0}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">In Stock</p>
                      <p className="text-2xl font-bold text-green-600">{reportData.summary?.inStock || 0}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Low Stock</p>
                      <p className="text-2xl font-bold text-orange-600">{reportData.summary?.lowStock || 0}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Out of Stock</p>
                      <p className="text-2xl font-bold text-red-600">{reportData.summary?.outOfStock || 0}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">All Products</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Selling Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.products?.map((product: any) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                product.stock <= (product.lowStockThreshold || 10) 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {product.stock} {product.unit}
                              </span>
                            </TableCell>
                            <TableCell>₹{product.sellingPrice?.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Low Stock Report */}
              {activeReport === "lowstock" && (
                <div>
                  <h3 className="font-semibold mb-2">Products Needing Restock ({reportData.lowStock?.length || 0})</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.lowStock?.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              {product.stock} {product.unit}
                            </span>
                          </TableCell>
                          <TableCell>{product.lowStockThreshold || 10} {product.unit}</TableCell>
                          <TableCell>
                            <span className="text-xs text-red-600 font-semibold">⚠️ LOW STOCK</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Customer Report */}
              {activeReport === "customer" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                      <p className="text-2xl font-bold">{reportData.stats?.totalCustomers || 0}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">New This Month</p>
                      <p className="text-2xl font-bold text-green-600">{reportData.stats?.newCustomersThisMonth || 0}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Repeat Customers</p>
                      <p className="text-2xl font-bold text-blue-600">{reportData.stats?.repeatCustomers || 0}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Top Customers</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Total Orders</TableHead>
                          <TableHead>Total Spent</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.customers?.slice(0, 10).map((customer: any) => (
                          <TableRow key={customer.id}>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>{customer.totalPurchases || 0}</TableCell>
                            <TableCell className="font-semibold">₹{customer.totalSpent?.toFixed(2) || "0.00"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Purchase Report */}
              {activeReport === "purchase" && (
                <div>
                  <h3 className="font-semibold mb-2">Recent Purchases</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Purchase No</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.purchases?.slice(0, 10).map((purchase: any) => (
                        <TableRow key={purchase.id}>
                          <TableCell>{purchase.purchaseNumber}</TableCell>
                          <TableCell>{purchase.supplierName}</TableCell>
                          <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                          <TableCell>₹{purchase.grandTotal?.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              purchase.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {purchase.paymentStatus}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
