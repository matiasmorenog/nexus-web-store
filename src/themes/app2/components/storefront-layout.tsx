import type { ReactNode } from "react";
import { Suspense } from "react";
import { Header } from "@/components/storefront/header";
import { PromoConfigSync } from "@/components/storefront/promo-config-sync";
import { WishlistSync } from "@/components/storefront/wishlist-sync";
import { App2Footer } from "@/themes/app2/components/app2-footer";
import { App2ThemeShell } from "@/themes/app2/components/app2-theme-shell";
import type { HeaderNavLink } from "@/lib/store-verticals/nav";
import type { VerticalConfig } from "@/lib/store-verticals/types";

type App2StorefrontLayoutProps = {
  children: ReactNode;
  storeDisplayName: string;
  config: VerticalConfig;
  wishlistEnabled?: boolean;
  promo2x1Active?: boolean;
  navDesktop?: HeaderNavLink[];
  navMobile?: HeaderNavLink[];
};

export function App2StorefrontLayout({
  children,
  storeDisplayName,
  config,
  wishlistEnabled = false,
  promo2x1Active = false,
  navDesktop = config.headerNavDesktop,
  navMobile = config.headerNavMobile,
}: App2StorefrontLayoutProps) {
  return (
    <App2ThemeShell initialCssVars={config.ui.cssVars}>
      {wishlistEnabled ? <WishlistSync /> : null}
      <PromoConfigSync promo2x1Active={promo2x1Active} />
      <Suspense
        fallback={
          <div className="h-[4.625rem] border-b border-white/10 bg-black/80" />
        }
      >
        <Header
          storeName={storeDisplayName}
          navDesktop={navDesktop}
          navMobile={navMobile}
          features={config.features}
          chrome="dark"
          uiVariant="app2"
          wishlistEnabled={wishlistEnabled}
          promo2x1Active={promo2x1Active}
        />
      </Suspense>
      <main className="storefront-content-bottom flex-1">{children}</main>
      <App2Footer
        storeName={storeDisplayName}
        tagline={config.metadata.description}
      />
    </App2ThemeShell>
  );
}
