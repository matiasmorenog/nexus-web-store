"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { StoreLogo } from "@/components/storefront/store-logo";
import { cn } from "@/lib/utils";

type HeaderProps = {
  storeName: string;
};

const navLinks = [
  { href: "/productos", label: "Catálogo", match: "catalog" as const },
  { href: "/productos?categoria=tops", label: "Tops", match: "tops" as const },
  { href: "/productos?categoria=leggings", label: "Leggings", match: "leggings" as const },
  { href: "/productos?categoria=shorts", label: "Shorts", match: "shorts" as const },
  { href: "/productos?categoria=accesorios", label: "Accesorios", match: "accesorios" as const },
];

export function Header({ storeName }: HeaderProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("categoria");

  const isActive = (match: (typeof navLinks)[number]["match"]) => {
    if (pathname !== "/productos") return false;
    if (match === "catalog") return !activeCategory;
    return activeCategory === match;
  };

  const navLinkClass = (match: (typeof navLinks)[number]["match"], mobile = false) =>
    cn(
      "transition-colors",
      mobile
        ? "block rounded-lg px-3 py-3 text-base"
        : "border-b-2 pb-0.5 text-sm font-medium",
      isActive(match)
        ? mobile
          ? "bg-neutral-100 text-[var(--brand-primary)]"
          : "border-[var(--brand-primary)] text-[var(--brand-primary)]"
        : mobile
          ? "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-900",
    );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="h-0.5 w-full bg-[var(--brand-primary)]" />

        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <StoreLogo storeName={storeName} />
          </div>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(link.match)}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/productos"
              aria-label="Buscar productos"
              className="rounded-lg p-2.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              type="button"
              aria-label="Abrir carrito"
              className="relative flex items-center gap-2 rounded-lg border border-[var(--brand-primary)] bg-transparent px-2.5 py-2.5 text-[var(--brand-primary)] transition-colors hover:bg-[var(--brand-primary-soft)] sm:px-3"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="hidden text-sm font-medium sm:inline">Carrito</span>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden border-t border-neutral-100 transition-all duration-200 lg:hidden",
            mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClass(link.match, true)}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
