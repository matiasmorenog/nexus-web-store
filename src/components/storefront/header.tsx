"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { ProductSearch } from "@/components/storefront/product-search";
import { PromoBanner } from "@/components/storefront/promo-banner";
import { HeaderProgressLine } from "@/components/storefront/header-progress-line";
import { promoBanner } from "@/lib/promo-banner";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { StoreLogo } from "@/components/storefront/store-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderProps = {
  storeName: string;
};

const navLinks = [
  { href: "/productos", label: "Catálogo", match: "catalog" as const },
  { href: "/productos?genero=mujer", label: "Mujer", match: "mujer" as const },
  { href: "/productos?genero=hombre", label: "Hombre", match: "hombre" as const },
  { href: "/productos?categoria=leggings", label: "Leggings", match: "leggings" as const },
  { href: "/productos?categoria=shorts", label: "Shorts", match: "shorts" as const },
  { href: "/productos?categoria=accesorios", label: "Accesorios", match: "accesorios" as const },
];

export function Header({ storeName }: HeaderProps) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const bannerWrapRef = useRef<HTMLDivElement>(null);
  const [promoActive, setPromoActive] = useState<boolean>(promoBanner.enabled);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badgePulse, setBadgePulse] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const lastAddedAt = useCartStore((s) => s.lastAddedAt);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("categoria");
  const activeGenero = searchParams.get("genero");

  useEffect(() => {
    setCartReady(true);
  }, []);

  useEffect(() => {
    const chromeNode = stickyRef.current;
    const bannerNode = bannerWrapRef.current;
    if (!chromeNode) return;

    const syncChromeHeight = () => {
      document.documentElement.style.setProperty(
        "--storefront-chrome-height",
        `${chromeNode.getBoundingClientRect().height}px`,
      );
    };

    const syncBannerHeight = () => {
      const height = bannerNode?.getBoundingClientRect().height ?? 0;
      document.documentElement.style.setProperty(
        "--storefront-banner-height",
        `${height}px`,
      );
    };

    const sync = () => {
      syncChromeHeight();
      syncBannerHeight();
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(chromeNode);
    if (bannerNode) observer.observe(bannerNode);

    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      document.documentElement.style.removeProperty("--storefront-chrome-height");
      document.documentElement.style.removeProperty("--storefront-banner-height");
    };
  }, [promoActive]);

  useEffect(() => {
    if (!cartReady || !lastAddedAt) return;

    setBadgePulse(true);
    const timeout = window.setTimeout(() => setBadgePulse(false), 500);
    return () => window.clearTimeout(timeout);
  }, [lastAddedAt, cartReady]);

  const isActive = (match: (typeof navLinks)[number]["match"]) => {
    if (pathname !== "/productos") return false;
    if (match === "catalog") return !activeCategory && !activeGenero;
    if (match === "mujer" || match === "hombre") {
      return activeGenero === match && !activeCategory;
    }
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
      <div ref={stickyRef} className="sticky top-0 z-40">
        <div
          ref={bannerWrapRef}
          className={cn(promoActive && "bg-[var(--brand-primary)]")}
        >
          <PromoBanner onActiveChange={setPromoActive} />
          <HeaderProgressLine />
        </div>
        <header className="relative border-b border-neutral-100 bg-white/90 shadow-sm backdrop-blur-md">
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
            <ProductSearch compact />
            <Button
              type="button"
              variant="secondary"
              aria-label="Abrir carrito"
              className="relative gap-2 px-2.5 sm:px-3"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="hidden sm:inline">Carrito</span>
              {cartReady && totalItems > 0 && (
                <span
                  className={cn(
                    "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] px-1 text-[10px] font-bold text-white",
                    badgePulse && "cart-badge-pop",
                  )}
                >
                  {totalItems}
                </span>
              )}
            </Button>
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
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
