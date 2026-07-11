"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CreditCard,
  ExternalLink,
  Gift,
  Heart,
  Home,
  LayoutTemplate,
  Megaphone,
  Menu,
  Package,
  Palette,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Webhook,
  X,
} from "lucide-react";
import { SignOutButton } from "@/components/admin/sign-out-button";
import {
  isModuleNavItemEnabled,
  type AdminNavIconKey,
  type AdminNavItem,
  type ModuleId,
} from "@/lib/modules";
import { moduleUpgradeHref } from "@/lib/modules/access";
import { cn } from "@/lib/utils";

const ADMIN_NAV_ICONS: Record<AdminNavIconKey, LucideIcon> = {
  dashboard: LayoutTemplate,
  products: Package,
  orders: ShoppingCart,
  config: Settings,
  plan: Sparkles,
  coupons: Gift,
  homeEditor: Home,
  analytics: BarChart3,
  cobros: CreditCard,
  crm: Users,
  shippingCarriers: Truck,
  marketing: Megaphone,
  multiUser: Users,
  api: Webhook,
  premiumThemes: Palette,
  seo: Search,
  wishlist: Heart,
};

type AdminNavProps = {
  brandPrefix: string;
  userName?: string | null;
  userEmail?: string | null;
  enabledModuleIds: ModuleId[];
  navItems: AdminNavItem[];
};

function AdminNavIcon({
  iconKey,
  className,
}: {
  iconKey: AdminNavIconKey;
  className?: string;
}) {
  const Icon = ADMIN_NAV_ICONS[iconKey];
  return <Icon className={className} />;
}

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemHref(
  item: AdminNavItem,
  enabledModuleIds: ModuleId[],
) {
  if (item.kind === "module" && !isModuleNavItemEnabled(item, enabledModuleIds)) {
    return moduleUpgradeHref(item.moduleId);
  }
  return item.href;
}

function DesktopNavLink({
  item,
  enabledModuleIds,
  pathname,
  onNavigate,
}: {
  item: AdminNavItem;
  enabledModuleIds: ModuleId[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isActive(pathname, item.href, item.exact);

  return (
    <Link
      href={navItemHref(item, enabledModuleIds)}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-white/10 text-white"
          : "text-neutral-400 hover:bg-white/5 hover:text-white",
      )}
    >
      <AdminNavIcon iconKey={item.iconKey} className="h-4 w-4 shrink-0" />
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate">{item.label}</span>
        {item.kind === "plan" ? (
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
            Plus
          </span>
        ) : null}
      </span>
    </Link>
  );
}

type AdminSidebarPanelProps = {
  brandPrefix: string;
  userName?: string | null;
  userEmail?: string | null;
  enabledModuleIds: ModuleId[];
  navItems: AdminNavItem[];
  pathname: string;
  onNavigate?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
};

function AdminSidebarPanel({
  brandPrefix,
  userName,
  userEmail,
  enabledModuleIds,
  navItems,
  pathname,
  onNavigate,
  showCloseButton = false,
  onClose,
}: AdminSidebarPanelProps) {
  const planItem = navItems.find((item) => item.kind === "plan");
  const mainItems = navItems.filter((item) => item.kind !== "plan");

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 sm:px-6">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="min-w-0 truncate text-lg font-bold text-white"
        >
          {brandPrefix}{" "}
          <span className="font-normal text-[var(--brand-primary)]">Admin</span>
        </Link>
        {showCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <nav
          aria-label="Navegación principal"
          className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-y-contain p-4 [-ms-overflow-style:none] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20"
        >
          {mainItems.map((item) => (
            <DesktopNavLink
              key={item.href}
              item={item}
              enabledModuleIds={enabledModuleIds}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        {planItem ? (
          <nav
            aria-label="Plan"
            className="shrink-0 space-y-1 border-t border-white/10 p-4"
          >
            <DesktopNavLink
              item={planItem}
              enabledModuleIds={enabledModuleIds}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          </nav>
        ) : null}
      </div>

      <div className="shrink-0 space-y-3 border-t border-white/10 p-4">
        <Link
          href="/"
          target="_blank"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Ver tienda
        </Link>
        {(userName || userEmail) && (
          <div className="rounded-lg bg-white/5 px-3 py-2.5">
            {userName && (
              <p className="truncate text-sm font-medium text-white">
                {userName}
              </p>
            )}
            {userEmail && (
              <p className="truncate text-xs text-neutral-500">{userEmail}</p>
            )}
          </div>
        )}
        <SignOutButton variant="dark" />
      </div>
    </>
  );
}

export function AdminNav({
  brandPrefix,
  userName,
  userEmail,
  enabledModuleIds,
  navItems,
}: AdminNavProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <>
      <aside className="relative hidden min-h-0 w-64 shrink-0 flex-col overflow-hidden bg-zinc-900 lg:flex lg:h-full">
        <div className="h-1 w-full shrink-0 bg-[var(--brand-primary)]" />
        <AdminSidebarPanel
          brandPrefix={brandPrefix}
          userName={userName}
          userEmail={userEmail}
          enabledModuleIds={enabledModuleIds}
          navItems={navItems}
          pathname={pathname}
        />
      </aside>

      <header className="relative z-30 shrink-0 border-b border-neutral-200 bg-white lg:hidden">
        <div className="h-0.5 w-full bg-[var(--brand-primary)]" />
        <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={mobileNavOpen}
            aria-controls="admin-mobile-nav"
            className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href="/admin"
            className="min-w-0 flex-1 truncate font-bold text-neutral-900"
          >
            {brandPrefix}{" "}
            <span className="text-[var(--brand-primary)]">Admin</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="rounded-lg px-2 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[var(--brand-primary)]"
            >
              Tienda
            </Link>
            <SignOutButton variant="light" compact />
          </div>
        </div>
      </header>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/50"
            onClick={closeMobileNav}
          />
          <aside
            id="admin-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de administración"
            className="relative flex h-full w-[min(100%,16rem)] flex-col overflow-hidden bg-zinc-900 shadow-xl"
          >
            <div className="h-1 w-full shrink-0 bg-[var(--brand-primary)]" />
            <AdminSidebarPanel
              brandPrefix={brandPrefix}
              userName={userName}
              userEmail={userEmail}
              enabledModuleIds={enabledModuleIds}
              navItems={navItems}
              pathname={pathname}
              onNavigate={closeMobileNav}
              showCloseButton
              onClose={closeMobileNav}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
