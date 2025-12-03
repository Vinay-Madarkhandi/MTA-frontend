"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { productApi } from "@/lib/api/products";
import { salesApi } from "@/lib/api/sales";
import { purchaseApi, PurchaseStats } from "@/lib/api/purchases";
import { InventorySummary, SalesStats } from "@/types";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [inventorySummary, setInventorySummary] =
    useState<InventorySummary | null>(null);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [purchaseStats, setPurchaseStats] = useState<PurchaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryData, salesData, purchaseData] = await Promise.all([
          productApi.getSummary(),
          salesApi.getSalesStats(),
          purchaseApi.getPurchaseStats(),
        ]);
        setInventorySummary(inventoryData);
        setSalesStats(salesData);
        setPurchaseStats(purchaseData);
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
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white space-y-8 p-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Overview of your business performance
          </p>
        </header>

        {/* Sales Overview */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Sales Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Today's Sales</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                    ₹{salesStats?.todaySales?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">Total revenue today</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Month Sales</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    ₹{salesStats?.monthSales?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">This month's revenue</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paid Transactions</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {salesStats?.paidTransactions || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Successfully completed</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receivable</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    ₹{salesStats?.totalReceivable?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Pending collections</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Purchase Overview */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Purchase Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Today's Purchases</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                    ₹{purchaseStats?.todayPurchases?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Total spent today</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Month Purchases</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    ₹{purchaseStats?.monthPurchases?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">This month's spending</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Paid Purchases</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {purchaseStats?.paidTransactions || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Completed payments</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Payable</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    ₹{purchaseStats?.totalPayable?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Pending payments</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Status */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Inventory Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {inventorySummary?.totalProducts || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Items in catalog</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Stock</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {inventorySummary?.inStock || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Available items</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {inventorySummary?.lowStock || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Needs restocking</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {inventorySummary?.outOfStock || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Unavailable items</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/stocks")}
              className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:bg-gray-300 dark:group-hover:bg-zinc-700 transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="font-medium text-gray-900 dark:text-white">Add Product</div>
              <p className="text-xs text-gray-500 mt-1">Create new inventory item</p>
            </button>
            <button
              onClick={() => router.push("/sales/new")}
              className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:bg-gray-300 dark:group-hover:bg-zinc-700 transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="font-medium text-gray-900 dark:text-white">New Sale</div>
              <p className="text-xs text-gray-500 mt-1">Process a new order</p>
            </button>
            <button
              onClick={() => router.push("/orders")}
              className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:bg-gray-300 dark:group-hover:bg-zinc-700 transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="font-medium text-gray-900 dark:text-white">View Orders</div>
              <p className="text-xs text-gray-500 mt-1">Manage all orders</p>
            </button>
            <button
              onClick={() => router.push("/reports")}
              className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:bg-gray-300 dark:group-hover:bg-zinc-700 transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="font-medium text-gray-900 dark:text-white">Reports</div>
              <p className="text-xs text-gray-500 mt-1">View analytics</p>
            </button>
          </div>
        </section>

        {/* Recent Orders */}
        <section className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <button
              onClick={() => router.push("/orders")}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
            >
              Go to Orders Page
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-green-400">+5 new order</p>
        </section>
      </div>
    </Layout>
  );
}
