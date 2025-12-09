"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ClipboardList,
  Warehouse,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  CreditCard,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isInventoryOpen, setIsInventoryOpen] = useState(true);

  const platformItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },

    { href: "/orders", icon: ClipboardList, label: "Orders" },
  ];

  const inventorySubItems = [
    { href: "/purchases", icon: ShoppingCart, label: "Purchase" },
    { href: "/purchase-returns", icon: RotateCcw, label: "Purchase Return" },
    { href: "/sales", icon: TrendingUp, label: "Sales" },
    { href: "/receipts", icon: Receipt, label: "Receipt" },
    { href: "/payments", icon: CreditCard, label: "Payment" },
  ];

  const managementItems = [
    { href: "/stocks", icon: Warehouse, label: "Stock" },
    { href: "/reports", icon: BarChart3, label: "Reports" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/billing", icon: CreditCard, label: "Billing" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
      {/* Brand */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-gray-200 dark:border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 dark:bg-zinc-800 group-hover:bg-blue-700 dark:group-hover:bg-zinc-700 transition-colors">
            <span className="text-base font-bold text-white">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none text-gray-900 dark:text-white">
              Shreeshai
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Enterprise
            </span>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Platform Section */}
        <div className="px-3 pb-4">
          <h2 className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Platform
          </h2>
          <div className="space-y-1">
            {platformItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Inventory with Submenu */}
            <div>
              <button
                onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4" />
                  <span>Voucher</span>
                </div>
                {isInventoryOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {/* Inventory Submenu */}
              {isInventoryOpen && (
                <div className="ml-6 mt-1 space-y-1 border-l border-gray-200 dark:border-zinc-800 pl-3">
                  {inventorySubItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Management Section */}
        <div className="px-3">
          <h2 className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Management
          </h2>
          <div className="space-y-1">
            {managementItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 dark:border-zinc-800 mt-auto">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-800">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {user?.name?.charAt(0).toUpperCase() || "T"}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium leading-none mb-1 text-gray-900 dark:text-white">
                {user?.name || "Test User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || "test123@test.com"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-md bg-gray-200 dark:bg-zinc-800 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
