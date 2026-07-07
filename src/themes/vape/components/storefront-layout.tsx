import type { ReactNode } from "react";
import { Suspense } from "react";
import { Header } from "@/components/storefront/header";
import { VapeFooter } from "@/themes/vape/components/vape-footer";
import { VapeThemeShell } from "@/themes/vape/components/vape-theme-shell";
import type { VerticalConfig } from "@/lib/store-verticals/types";

type VapeStorefrontLayoutProps = {
  children: ReactNode;
  storeDisplayName: string;
  config: VerticalConfig;
};

export function VapeStorefrontLayout({
  children,
  storeDisplayName,
  config,
}: VapeStorefrontLayoutProps) {
  return (
    <VapeThemeShell initialCssVars={config.ui.cssVars}>
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
