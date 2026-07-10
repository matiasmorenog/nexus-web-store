import type { ReactNode } from "react";
import { Suspense } from "react";
import { Header } from "@/components/storefront/header";
import { PromoConfigSync } from "@/components/storefront/promo-config-sync";
import { WishlistSync } from "@/components/storefront/wishlist-sync";
import { App2Footer } from "@/themes/app2/components/app2-footer";
import { App2ThemeShell } from "@/themes/app2/components/app2-theme-shell";
import type { ResolvedStoreTheme } from "@/lib/premium-themes";
import type { App2ColorThemeId } from "@/lib/store-verticals/app2/themes";
import type { VerticalConfig } from "@/lib/store-verticals/types";

type App2StorefrontLayoutProps = {
  children: ReactNode;
  storeDisplayName: string;
  config: VerticalConfig;
  wishlistEnabled?: boolean;
  storeTheme?: ResolvedStoreTheme;
  promo2x1Active?: boolean;
};

export function App2StorefrontLayout({
  children,
  storeDisplayName,
  config,
  wishlistEnabled = false,
  storeTheme,
  promo2x1Active = false,
}: App2StorefrontLayoutProps) {
  const app2ThemeId =
    storeTheme?.themeId && storeTheme.themeId !== "default"
      ? (storeTheme.themeId as App2ColorThemeId)
      : undefined;
  const showApp2ThemeToggle = storeTheme?.moduleActive
    ? storeTheme.allowCustomerThemeToggle
    : true;

  return (
    <App2ThemeShell
      initialCssVars={config.ui.cssVars}
      storeThemeId={app2ThemeId}
      allowCustomerThemeToggle={showApp2ThemeToggle}
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
          uiVariant="app2"
          wishlistEnabled={wishlistEnabled}
          showApp2ThemeToggle={showApp2ThemeToggle}
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
