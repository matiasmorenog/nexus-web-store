"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { ProductSearch } from "@/components/storefront/product-search";
import { PromoBanner } from "@/components/storefront/promo-banner";
import { HeaderProgressLine } from "@/components/storefront/header-progress-line";
import { promoBanner } from "@/lib/promo-banner";
import {
  isStorefrontNavActive,
  type HeaderNavLink,
} from "@/lib/store-verticals/nav";
import type { VerticalFeatures } from "@/lib/store-verticals/types";
import { Promo2x1Badge } from "@/components/storefront/promo-2x1-badge";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { StoreLogo } from "@/components/storefront/store-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderProps = {
  storeName: string;
  brandSuffix: string;
  navDesktop: HeaderNavLink[];
  navMobile: HeaderNavLink[];
  features: VerticalFeatures;
};

export function Header({
  storeName,
  brandSuffix,
  navDesktop,
  navMobile,
  features,
}: HeaderProps) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const bannerWrapRef = useRef<HTMLDivElement>(null);
  const [promoActive, setPromoActive] = useState<boolean>(
    features.promoBanner && promoBanner.enabled,
  );
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

  const navParams = {
    genero: activeGenero,
    categoria: activeCategory,
    promo: searchParams.get("promo"),
    destacados: searchParams.get("destacados"),
  };

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

  const navLinkClass = (link: HeaderNavLink, mobile = false) => {
    const active = isStorefrontNavActive(link.match, pathname, navParams);
    const isPromo2x1 = link.accent === "promo2x1";

    if (isPromo2x1 && !mobile) {
      return cn(
        "inline-flex items-center border-b-0 pb-0 transition-transform hover:scale-105",
        active && "scale-105",
      );
    }

    return cn(
      "transition-colors",
      mobile
        ? "block rounded-lg px-3 py-3 text-base"
        : "border-b-2 pb-0.5 text-sm font-medium",
      active
        ? mobile
          ? "bg-neutral-100 text-[var(--brand-primary)]"
          : "border-[var(--brand-primary)] text-[var(--brand-primary)]"
        : mobile
          ? "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-900",
    );
  };

  const navLinkLabel = (link: HeaderNavLink, mobile = false) => {
    if (link.accent === "promo2x1") {
      return (
        <Promo2x1Badge
          label={link.label}
          size={mobile ? "md" : "sm"}
          className={cn(
            mobile && "pointer-events-none",
            !mobile &&
              isStorefrontNavActive(link.match, pathname, navParams) &&
              "ring-2 ring-[var(--brand-primary)] ring-offset-2",
          )}
        />
      );
    }

    return link.label;
  };

  return (
    <>
      <div ref={stickyRef} className="sticky top-0 z-40">
        <div
          ref={bannerWrapRef}
          className={cn(features.promoBanner && promoActive && "bg-[var(--brand-primary)]")}
        >
          {features.promoBanner ? (
            <PromoBanner onActiveChange={setPromoActive} />
          ) : null}
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
            <StoreLogo storeName={storeName} brandSuffix={brandSuffix} />
          </div>

          <nav className="hidden items-center gap-5 xl:gap-6 lg:flex">
            {navDesktop.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(link)}>
                {navLinkLabel(link)}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {features.productSearch ? <ProductSearch compact /> : null}
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
            mobileOpen ? "max-h-[min(70vh,28rem)] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="max-h-[min(70vh,28rem)] space-y-1 overflow-y-auto px-4 py-3">
            {navMobile.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClass(link, true)}
                onClick={() => setMobileOpen(false)}
              >
                {navLinkLabel(link, true)}
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
