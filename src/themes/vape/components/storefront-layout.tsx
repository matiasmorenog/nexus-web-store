import type { ReactNode } from "react";
import { Suspense } from "react";
import { Header } from "@/components/storefront/header";
import { WishlistSync } from "@/components/storefront/wishlist-sync";
import { VapeFooter } from "@/themes/vape/components/vape-footer";
import { VapeThemeShell } from "@/themes/vape/components/vape-theme-shell";
import type { VerticalConfig } from "@/lib/store-verticals/types";

type VapeStorefrontLayoutProps = {
  children: ReactNode;
  storeDisplayName: string;
  config: VerticalConfig;
  wishlistEnabled?: boolean;
};

export function VapeStorefrontLayout({
  children,
  storeDisplayName,
  config,
  wishlistEnabled = false,
}: VapeStorefrontLayoutProps) {
  return (
    <VapeThemeShell initialCssVars={config.ui.cssVars}>
      {wishlistEnabled ? <WishlistSync /> : null}
      <Suspense
        fallback={
          <div className="h-[4.625rem] border-b border-white/10 bg-black/80" />
        }
      >
        <Header
          storeName={storeDisplayName}
          navDesktop={config.headerNavDesktop}
          navMobile={config.headerNavMobile}
          features={config.features}
          chrome="dark"
          uiVariant="vape"
          wishlistEnabled={wishlistEnabled}
        />
      </Suspense>
      <main className="storefront-content-bottom flex-1">{children}</main>
      <VapeFooter
        storeName={storeDisplayName}
        tagline={config.metadata.description}
      />
    </VapeThemeShell>
  );
}
