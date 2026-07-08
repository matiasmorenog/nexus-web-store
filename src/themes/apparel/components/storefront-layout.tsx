import type { CSSProperties, ReactNode } from "react";
import { Suspense } from "react";
import { Header } from "@/components/storefront/header";
import { PromoConfigSync } from "@/components/storefront/promo-config-sync";
import { WishlistSync } from "@/components/storefront/wishlist-sync";
import { Footer } from "@/themes/apparel/components/footer";
import type { VerticalConfig } from "@/lib/store-verticals/types";
import "@/themes/apparel/styles/theme.css";

type ApparelStorefrontLayoutProps = {
  children: ReactNode;
  storeDisplayName: string;
  config: VerticalConfig;
  brandPrimary: string;
  wishlistEnabled?: boolean;
  promo2x1Active?: boolean;
};

export function ApparelStorefrontLayout({
  children,
  storeDisplayName,
  config,
  brandPrimary,
  wishlistEnabled = false,
  promo2x1Active = false,
}: ApparelStorefrontLayoutProps) {
  const themeStyle = {
    ...config.ui.cssVars,
    "--brand-primary": brandPrimary,
  } as CSSProperties;

  return (
    <div
      data-storefront-ui={config.ui.id}
      style={themeStyle}
      className="storefront-theme relative flex min-h-full flex-1 flex-col bg-[var(--storefront-bg,var(--background))]"
    >
      {wishlistEnabled ? <WishlistSync /> : null}
      <PromoConfigSync promo2x1Active={promo2x1Active} />
      <Suspense
        fallback={
          <div className="h-[4.625rem] border-b border-neutral-100 bg-white/90 shadow-sm" />
        }
      >
        <Header
          storeName={storeDisplayName}
          navDesktop={config.headerNavDesktop}
          navMobile={config.headerNavMobile}
          features={config.features}
          chrome="light"
          uiVariant="apparel"
          wishlistEnabled={wishlistEnabled}
          promo2x1Active={promo2x1Active}
        />
      </Suspense>
      <main className="storefront-content-bottom flex-1">{children}</main>
      <Footer
        storeName={storeDisplayName}
        tagline={config.metadata.description}
        features={config.features}
        chrome="light"
      />
    </div>
  );
}
