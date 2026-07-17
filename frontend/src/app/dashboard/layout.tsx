"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  ClipboardList, 
  ShieldAlert, 
  LogOut, 
  ArrowLeft,
  Loader2,
  Shield,
  Menu,
  X,
  Bell
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

const sidebarLinks = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/dashboard/events", icon: Calendar },
  { label: "Registrations", href: "/dashboard/registrations", icon: ClipboardList },
  { label: "Members", href: "/dashboard/members", icon: Users, superAdminOnly: true },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Activity Log", href: "/dashboard/activity", icon: ClipboardList },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex flex-col items-center justify-center gap-4 text-muted">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">Verifying administrator credentials...</p>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#13131A] border border-glass-border p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
          <div className="mx-auto w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Authentication Required</h3>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            Please sign in with an authorized Google account from the homepage to access the administrator panel.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface/50 hover:bg-surface border border-glass-border text-foreground font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // 3. Unauthorized State (Member rank)
  const isSuperAdmin = user.role === "super_admin";
  const isAdmin = user.role === "admin" || isSuperAdmin;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#13131A] border border-glass-border p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
          <div className="mx-auto w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Access Denied</h3>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            You are signed in as <span className="text-foreground font-semibold">{user.email}</span>. 
            This account does not have administrator privileges.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface/50 hover:bg-surface border border-glass-border text-foreground font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Helper to determine if link is active
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-foreground flex">
      {/* ─── Sidebar (Desktop) ────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0F0F15] border-r border-glass-border">
        {/* Header */}
        <div className="p-6 border-b border-glass-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-sm leading-tight text-foreground">Cyber Security Club</h1>
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            if (link.superAdminOnly && !isSuperAdmin) return null;
            const LinkIcon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 border border-primary/20 text-primary"
                    : "border border-transparent text-muted hover:text-foreground hover:bg-surface/30"
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile card */}
        <div className="p-4 border-t border-glass-border flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-surface/50 border border-glass-border flex items-center justify-center text-xs font-semibold uppercase text-primary">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-foreground truncate">{user.name}</h4>
              <span className="text-[9px] text-muted font-mono uppercase tracking-wider">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-glass-border hover:bg-red-500/10 hover:border-red-500/20 text-muted hover:text-red-400 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main Portal Wrapper ──────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header (Top Navigation) */}
        <header className="h-16 bg-[#0F0F15]/50 backdrop-blur-md border-b border-glass-border px-4 sm:px-6 flex items-center justify-between z-40">
          <div className="flex items-center gap-4">
            {/* Hamburger button (Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg border border-glass-border text-muted hover:text-foreground cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Workspace</span>
              <span className="text-xs text-muted">/</span>
              <span className="text-xs font-medium text-foreground truncate">
                {sidebarLinks.find(link => isActive(link.href))?.label || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-glass-border text-muted hover:text-foreground hover:bg-surface/50 text-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Website Home
            </Link>
          </div>
        </header>

        {/* Page Content Portal */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0B0B0F] relative">
          {children}
        </main>
      </div>

      {/* ─── Sidebar Overlay (Mobile) ────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#0B0B0F]/80 backdrop-blur-sm"
            />

            {/* Panel */}
            <div className="relative flex flex-col w-64 max-w-xs bg-[#0F0F15] border-r border-glass-border h-full z-10 p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-5 border-b border-glass-border mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold tracking-wider text-foreground">CSC Admin</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-glass-border text-muted hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                {sidebarLinks.map((link) => {
                  if (link.superAdminOnly && !isSuperAdmin) return null;
                  const LinkIcon = link.icon;
                  const active = isActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-primary/10 border border-primary/20 text-primary"
                          : "border border-transparent text-muted hover:text-foreground hover:bg-surface/30"
                      }`}
                    >
                      <LinkIcon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Profile Card & Logout */}
              <div className="border-t border-glass-border pt-4 mt-auto flex flex-col gap-3">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-8 h-8 rounded-full bg-surface/50 border border-glass-border flex items-center justify-center text-xs font-semibold uppercase text-primary">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-foreground truncate">{user.name}</h4>
                    <span className="text-[8px] text-muted font-mono uppercase tracking-wider">
                      {user.role.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-glass-border hover:bg-red-500/10 hover:border-red-500/20 text-muted hover:text-red-400 text-xs font-semibold transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
