import type { CSSProperties, ReactNode } from "react";
import { Suspense } from "react";
import { Header } from "@/components/storefront/header";
import { PromoConfigSync } from "@/components/storefront/promo-config-sync";
import { WishlistSync } from "@/components/storefront/wishlist-sync";
import type { HeaderNavLink } from "@/lib/store-verticals/nav";
import type { VerticalConfig } from "@/lib/store-verticals/types";
import { ManovivaFooter } from "@/themes/app3/components/manoviva-footer";
import "@/themes/app3/styles/theme.css";

type App3StorefrontLayoutProps = {
  children: ReactNode;
  storeDisplayName: string;
  config: VerticalConfig;
  wishlistEnabled?: boolean;
  navDesktop?: HeaderNavLink[];
  navMobile?: HeaderNavLink[];
};

export function App3StorefrontLayout({
  children,
  storeDisplayName,
  config,
  wishlistEnabled = false,
  navDesktop = config.headerNavDesktop,
  navMobile = config.headerNavMobile,
}: App3StorefrontLayoutProps) {
  return (
    <div
      data-storefront-ui="app3"
      lang="it"
      style={config.ui.cssVars as CSSProperties}
      className="storefront-theme manoviva-theme relative flex min-h-full flex-1 flex-col bg-[#F2F0E9]"
    >
      {wishlistEnabled ? <WishlistSync /> : null}
      <PromoConfigSync promo2x1Active={false} />
      <Suspense fallback={<div className="h-[4.625rem] border-b border-black/10 bg-[#F2F0E9]/95" />}>
        <Header
          storeName={storeDisplayName}
          navDesktop={navDesktop}
          navMobile={navMobile}
          features={config.features}
          chrome="light"
          uiVariant="app3"
          wishlistEnabled={wishlistEnabled}
          promo2x1Active={false}
        />
      </Suspense>
      <main className="storefront-content-bottom flex-1">{children}</main>
      <ManovivaFooter />
    </div>
  );
}
