"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { productApi } from "@/lib/api/products";
import { orderApi } from "@/lib/api/orders";
import { InventorySummary, DashboardStats, Order } from "@/types";
import { DEMO_MODE } from "@/lib/mockData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Sparkles,
  AlertTriangle,
  Ban,
  Plus,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [inventorySummary, setInventorySummary] =
    useState<InventorySummary | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryData, statsData, ordersData] = await Promise.all([
          productApi.getSummary(),
          orderApi.getTodaysStats(),
          orderApi.getRecent(5),
        ]);
        setInventorySummary(inventoryData);
        setStats(statsData);
        setRecentOrders(ordersData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {DEMO_MODE && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Demo Mode Active:</strong> Using mock data for
                  demonstration. All changes are temporary and won't be saved.
                  Connect backend to use real data.
                </p>
              </div>
            </div>
          </div>
        )}

        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business performance
          </p>
        </header>

        {/* Sales Overview */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Sales Overview
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Sales
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ₹{stats?.totalSales || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total revenue today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Paid Orders
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats?.paidCount || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Successfully completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats?.pendingCount || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cancelled
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats?.cancelledCount || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Orders cancelled
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Inventory Status */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Inventory Status
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Products
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {inventorySummary?.totalProducts || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Items in catalog
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In Stock
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {inventorySummary?.inStock || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Low Stock
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {inventorySummary?.lowStock || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Needs restocking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Out of Stock
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Ban className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {inventorySummary?.outOfStock || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unavailable items
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => router.push("/products")}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <Plus className="h-5 w-5 text-foreground" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    Add Product
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create new inventory item
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => router.push("/sales/new")}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    New Sale
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Process a new order
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => router.push("/orders")}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    View Orders
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage all orders
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => router.push("/reports")}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    Reports
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">View analytics</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Orders */}
        <section className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold tracking-tight">
                    Recent Orders
                  </CardTitle>
                  <p className="text-sm text-green-600 mt-1">
                    +{recentOrders.length} new order
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => router.push("/orders")}
                >
                  Go to Orders Page
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground">ID</TableHead>
                    <TableHead className="text-muted-foreground">
                      Item
                    </TableHead>
                    <TableHead className="text-muted-foreground">Qty</TableHead>
                    <TableHead className="text-muted-foreground">
                      Order Date
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No recent orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-muted-foreground">
                          {order.orderId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.customer}
                        </TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{order.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "paid"
                                ? "default"
                                : order.status === "pending"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              order.status === "paid"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : order.status === "pending"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            }
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
