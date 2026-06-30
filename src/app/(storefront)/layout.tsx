import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Suspense } from "react";
import { Footer } from "@/components/storefront/footer";
import { Header } from "@/components/storefront/header";
import { formatStoreName, getStore } from "@/lib/store-context";
import { getVerticalConfig } from "@/lib/store-verticals";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore();
  const config = getVerticalConfig();
  const displayName = formatStoreName(store.name);

  return {
    title: {
      default: displayName,
      template: `%s | ${displayName}`,
    },
    description: config.metadata.description,
  };
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await getStore();
  const config = getVerticalConfig();
  const displayName = formatStoreName(store.name);
  const brandPrimary =
    store.primaryColor?.trim() || config.ui.cssVars["--brand-primary"];

  const themeStyle = {
    ...config.ui.cssVars,
    "--brand-primary": brandPrimary,
  } as CSSProperties;

  return (
    <div
      data-storefront-ui={config.ui.id}
      style={themeStyle}
      className="storefront-theme flex min-h-full flex-1 flex-col"
    >
      <Suspense
        fallback={
          <div className="h-[4.625rem] border-b border-neutral-100 bg-white/90 shadow-sm" />
        }
      >
        <Header
          storeName={displayName}
          brandSuffix={config.brandSuffix}
          navDesktop={config.headerNavDesktop}
          navMobile={config.headerNavMobile}
          features={config.features}
        />
      </Suspense>
      <main className="storefront-content-bottom flex-1">{children}</main>
      <Footer
        storeName={displayName}
        brandSuffix={config.brandSuffix}
        tagline={config.metadata.description}
        features={config.features}
      />
    </div>
  );
}
