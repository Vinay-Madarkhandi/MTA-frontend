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
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const platformItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/products", icon: Package, label: "Inventory" },
    { href: "/sales", icon: TrendingUp, label: "Sales" },
    { href: "/orders", icon: ClipboardList, label: "Orders" },
  ];

  const managementItems = [
    { href: "/stocks", icon: Warehouse, label: "Stock" },
    { href: "/reports", icon: BarChart3, label: "Reports" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-background flex flex-col">
      {/* Brand */}
      <div className="flex h-14 items-center justify-between px-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary group-hover:bg-primary/90 transition-colors">
            <span className="text-base font-bold text-primary-foreground">
              S
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">
              Shreeshai
            </span>
            <span className="text-xs text-muted-foreground">Enterprise</span>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Platform Section */}
        <div className="px-3 pb-4">
          <h2 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Management Section */}
        <div className="px-3">
          <h2 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
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
      <div className="border-t mt-auto">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <span className="text-sm font-semibold text-muted-foreground">
                {user?.name?.charAt(0).toUpperCase() || "T"}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium leading-none mb-1">
                {user?.name || "Test User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || "test123@test.com"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
