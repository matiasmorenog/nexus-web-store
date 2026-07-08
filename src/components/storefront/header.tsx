"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { ProductSearch } from "@/components/storefront/product-search";
import { PromoBanner } from "@/themes/apparel/components/promo-banner";
import { HeaderProgressLine } from "@/components/storefront/header-progress-line";
import {
  isStorefrontNavActive,
  type HeaderNavLink,
} from "@/lib/store-verticals/nav";
import type { VerticalFeatures } from "@/lib/store-verticals/types";
import { Promo2x1Badge } from "@/components/storefront/promo-2x1-badge";
import { useEffect, useRef, useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";
import { useCartStore } from "@/stores/cart-store";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { HeaderAccountLink } from "@/components/storefront/header-account-link";
import { WishlistHeaderLink } from "@/components/storefront/wishlist-header-link";
import { VapeStoreLogo } from "@/themes/vape/components/home/vape-store-logo";
import { VapeThemeToggle } from "@/themes/vape/components/vape-theme-toggle";
import { StoreLogo } from "@/components/storefront/store-logo";
import { Button } from "@/components/ui/button";
import { VapeButton } from "@/themes/vape/components/vape-button";
import { cn } from "@/lib/utils";

type HeaderProps = {
  storeName: string;
  navDesktop: HeaderNavLink[];
  navMobile: HeaderNavLink[];
  features: VerticalFeatures;
  chrome?: "light" | "dark";
  uiVariant?: "apparel" | "vape";
  wishlistEnabled?: boolean;
  showVapeThemeToggle?: boolean;
  /** 2x1 activo (módulo coupons + toggle). Controla banner y links promo. */
  promo2x1Active?: boolean;
};

export function Header({
  storeName,
  navDesktop,
  navMobile,
  features,
  chrome = "light",
  uiVariant = "apparel",
  wishlistEnabled = false,
  showVapeThemeToggle = true,
  promo2x1Active = false,
}: HeaderProps) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const bannerWrapRef = useRef<HTMLDivElement>(null);
  const bannerEnabled = features.promoBanner && promo2x1Active;
  const [promoActive, setPromoActive] = useState<boolean>(bannerEnabled);
  const visibleNavDesktop = promo2x1Active
    ? navDesktop
    : navDesktop.filter((link) => link.accent !== "promo2x1");
  const visibleNavMobile = promo2x1Active
    ? navMobile
    : navMobile.filter((link) => link.accent !== "promo2x1");
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badgePulse, setBadgePulse] = useState(false);
  const cartReady = useHydrated();
  const [locationHash, setLocationHash] = useState("");
  const [activeNavKey, setActiveNavKey] = useState<string | null>(null);
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
    const syncHashNav = () => {
      const hash = window.location.hash;
      setLocationHash(hash);

      const id = hash.replace(/^#/, "");
      if (id === "ofertas") {
        setActiveNavKey("ofertas");
      } else if (id === "productos-vape") {
        setActiveNavKey("productos");
      } else if (id === "categorias") {
        setActiveNavKey((prev) =>
          prev === "dispositivos" ||
          prev === "liquidos" ||
          prev === "pods" ||
          prev === "accesorios" ||
          prev === "categorias"
            ? prev
            : null,
        );
      } else if (!id) {
        setActiveNavKey(null);
      }
    };

    syncHashNav();
    window.addEventListener("hashchange", syncHashNav);
    return () => window.removeEventListener("hashchange", syncHashNav);
  }, []);

  const navActiveContext = {
    hash: locationHash,
    navKey: activeNavKey,
  };

  const handleNavClick = (link: HeaderNavLink) => {
    if (link.navKey) {
      setActiveNavKey(link.navKey);
    } else if (link.match.type === "contact") {
      setActiveNavKey(null);
    }
  };

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

    let timeout: number | undefined;
    const frame = requestAnimationFrame(() => {
      setBadgePulse(true);
      timeout = window.setTimeout(() => setBadgePulse(false), 500);
    });

    return () => {
      cancelAnimationFrame(frame);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [lastAddedAt, cartReady]);

  const isDarkChrome = chrome === "dark";
  const isVapeUi = uiVariant === "vape";

  const navLinkClass = (link: HeaderNavLink, mobile = false) => {
    const active = isStorefrontNavActive(link.match, pathname, navParams, {
      ...navActiveContext,
      linkNavKey: link.navKey,
    });
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
          ? isDarkChrome
            ? "bg-white/10 text-[var(--brand-primary-light)]"
            : "bg-neutral-100 text-[var(--brand-primary)]"
          : isDarkChrome
            ? "border-[var(--brand-primary)] text-[var(--brand-primary-light)]"
            : "border-[var(--brand-primary)] text-[var(--brand-primary)]"
        : mobile
          ? isDarkChrome
            ? isVapeUi
              ? "text-vape-muted hover:bg-white/5 hover:text-[var(--brand-primary-light)]"
              : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          : isDarkChrome
            ? isVapeUi
              ? "border-transparent text-vape-muted hover:border-[color-mix(in_srgb,var(--brand-primary)_30%,transparent)] hover:text-[var(--brand-primary-light)]"
              : "border-transparent text-neutral-400 hover:border-white/20 hover:text-neutral-100"
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
              isStorefrontNavActive(link.match, pathname, navParams, {
                ...navActiveContext,
                linkNavKey: link.navKey,
              }) &&
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
          className={cn(bannerEnabled && promoActive && "bg-[var(--brand-primary)]")}
        >
          {bannerEnabled ? (
            <PromoBanner onActiveChange={setPromoActive} />
          ) : null}
          <HeaderProgressLine />
        </div>
        <header
          className={cn(
            "relative border-b shadow-sm backdrop-blur-md",
            isDarkChrome
              ? "border-white/10 bg-[color-mix(in_srgb,var(--brand-primary-darker)_80%,transparent)]"
              : "border-neutral-100 bg-white/90",
          )}
        >
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              className={cn(
                "rounded-lg p-2 lg:hidden",
                isDarkChrome
                  ? "text-neutral-300 hover:bg-white/10"
                  : "text-neutral-700 hover:bg-neutral-100",
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {isVapeUi ? (
              <VapeStoreLogo storeName={storeName} />
            ) : (
              <StoreLogo storeName={storeName} />
            )}
          </div>

          <nav className="hidden items-center gap-5 xl:gap-6 lg:flex">
            {visibleNavDesktop.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={navLinkClass(link)}
                onClick={() => handleNavClick(link)}
              >
                {navLinkLabel(link)}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {isVapeUi && showVapeThemeToggle ? (
              <>
                <VapeThemeToggle compact className="flex sm:hidden" />
                <VapeThemeToggle className="hidden sm:flex" />
              </>
            ) : null}
            {features.productSearch ? <ProductSearch compact /> : null}
            {wishlistEnabled ? (
              <WishlistHeaderLink chrome={chrome} uiVariant={uiVariant} />
            ) : null}
            <HeaderAccountLink chrome={chrome} uiVariant={uiVariant} />
            {isVapeUi ? (
              <VapeButton
                type="button"
                variant="ghost"
                size="md"
                aria-label="Abrir carrito"
                className="relative h-10 w-10 px-0"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartReady && totalItems > 0 && (
                  <span
                    className={cn(
                      "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] px-1 text-[10px] font-bold text-[var(--ui-button-primary-foreground,#08080e)]",
                      badgePulse && "cart-badge-pop",
                    )}
                  >
                    {totalItems}
                  </span>
                )}
              </VapeButton>
            ) : (
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
                      "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] px-1 text-[10px] font-bold text-[var(--ui-button-primary-foreground,#08080e)]",
                      badgePulse && "cart-badge-pop",
                    )}
                  >
                    {totalItems}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden border-t transition-all duration-200 lg:hidden",
            isDarkChrome ? "border-white/10" : "border-neutral-100",
            mobileOpen ? "max-h-[min(70vh,28rem)] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="max-h-[min(70vh,28rem)] space-y-1 overflow-y-auto px-4 py-3">
            {visibleNavMobile.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={navLinkClass(link, true)}
                onClick={() => {
                  handleNavClick(link);
                  setMobileOpen(false);
                }}
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
