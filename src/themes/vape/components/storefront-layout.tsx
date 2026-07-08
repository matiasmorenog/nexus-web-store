import type { ReactNode } from "react";
import { Suspense } from "react";
import { Header } from "@/components/storefront/header";
import { PromoConfigSync } from "@/components/storefront/promo-config-sync";
import { WishlistSync } from "@/components/storefront/wishlist-sync";
import { VapeFooter } from "@/themes/vape/components/vape-footer";
import { VapeThemeShell } from "@/themes/vape/components/vape-theme-shell";
import type { ResolvedStoreTheme } from "@/lib/premium-themes";
import type { VapeColorThemeId } from "@/lib/store-verticals/vape/themes";
import type { VerticalConfig } from "@/lib/store-verticals/types";

type VapeStorefrontLayoutProps = {
  children: ReactNode;
  storeDisplayName: string;
  config: VerticalConfig;
  wishlistEnabled?: boolean;
  storeTheme?: ResolvedStoreTheme;
  promo2x1Active?: boolean;
};

export function VapeStorefrontLayout({
  children,
  storeDisplayName,
  config,
  wishlistEnabled = false,
  storeTheme,
  promo2x1Active = false,
}: VapeStorefrontLayoutProps) {
  const vapeThemeId =
    storeTheme?.themeId && storeTheme.themeId !== "default"
      ? (storeTheme.themeId as VapeColorThemeId)
      : undefined;
  const showVapeThemeToggle = storeTheme?.moduleActive
    ? storeTheme.allowCustomerThemeToggle
    : true;

  return (
    <VapeThemeShell
      initialCssVars={config.ui.cssVars}
      storeThemeId={vapeThemeId}
      allowCustomerThemeToggle={showVapeThemeToggle}
    >
      {wishlistEnabled ? <WishlistSync /> : null}
      <PromoConfigSync promo2x1Active={promo2x1Active} />
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
          showVapeThemeToggle={showVapeThemeToggle}
          promo2x1Active={promo2x1Active}
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
