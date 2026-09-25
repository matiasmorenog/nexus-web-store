import type { Metadata } from "next";
import { StorefrontMarketingShell } from "@/components/storefront/storefront-marketing-shell";
import { StorefrontWebsiteJsonLd } from "@/components/storefront/seo-website-json-ld";
import { truncateMetaDescription } from "@/lib/seo/format";
import {
  buildSeoContext,
  buildStorefrontMetadata,
} from "@/lib/seo/build-metadata";
import { getResolvedStoreSeoSettings } from "@/lib/seo/query";
import { getStoreMarketingSettings } from "@/lib/marketing/query";
import { getResolvedStoreTheme } from "@/lib/premium-themes";
import { isPromo2x1ActiveForStore } from "@/lib/promotions";
import { storeHasModule } from "@/lib/modules";
import {
  applyStoreCategoriesToHeaderNav,
  getStoreNavCategories,
} from "@/lib/store-categories";
import { formatStoreName, getStore, getStoreId } from "@/lib/store-context";
import { getStorefrontConfig } from "@/lib/store-verticals";
import { App1StorefrontLayout } from "@/themes/app1/components/storefront-layout";
import { App2StorefrontLayout } from "@/themes/app2/components/storefront-layout";
import { App3StorefrontLayout } from "@/themes/app3/components/storefront-layout";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore();
  const config = getStorefrontConfig();
  const displayName = formatStoreName(store.name);
  const seoSettings = await getResolvedStoreSeoSettings(store.id);
  const context = buildSeoContext(displayName, config.metadata.description);
  const metadata = buildStorefrontMetadata(seoSettings, context, { path: "/" });

  return {
    ...metadata,
    title: {
      default: displayName,
      template: `%s | ${displayName}`,
    },
  };
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await getStore();
  const storeId = await getStoreId();
  const config = getStorefrontConfig();
  const displayName = formatStoreName(store.name);
  const brandPrimary =
    store.primaryColor?.trim() || config.ui.cssVars["--brand-primary"];
  const seoSettings = await getResolvedStoreSeoSettings(store.id);
  const seoContext = buildSeoContext(displayName, config.metadata.description);
  const description = truncateMetaDescription(
    seoSettings?.metaDescription.trim() || config.metadata.description,
  );
  const structuredData =
    seoSettings?.structuredDataEnabled ? (
      <StorefrontWebsiteJsonLd
        name={displayName}
        url={seoContext.siteUrl}
        description={description}
        language={config.locale}
      />
    ) : null;
  const wishlistEnabled = await storeHasModule(store.id, "wishlist");
  const marketing = await getStoreMarketingSettings(storeId);
  const storeTheme = await getResolvedStoreTheme(storeId);
  const [promo2x1Active, navCategories] = await Promise.all([
    config.features.promo2x1
      ? isPromo2x1ActiveForStore(storeId)
      : Promise.resolve(false),
    getStoreNavCategories(storeId),
  ]);
  const navDesktop = applyStoreCategoriesToHeaderNav(
    config.headerNavDesktop,
    navCategories,
  );
  const navMobile = applyStoreCategoriesToHeaderNav(
    config.headerNavMobile,
    navCategories,
  );

  if (config.ui.id === "app2") {
    return (
      <StorefrontMarketingShell settings={marketing}>
        {structuredData}
        <App2StorefrontLayout
          storeDisplayName={displayName}
          config={config}
          wishlistEnabled={wishlistEnabled}
          storeTheme={storeTheme}
          promo2x1Active={promo2x1Active}
          navDesktop={navDesktop}
          navMobile={navMobile}
        >
          {children}
        </App2StorefrontLayout>
      </StorefrontMarketingShell>
    );
  }

  if (config.ui.id === "app3") {
    return (
      <StorefrontMarketingShell settings={marketing}>
        {structuredData}
        <App3StorefrontLayout
          storeDisplayName={displayName}
          config={config}
          wishlistEnabled={wishlistEnabled}
          navDesktop={navDesktop}
          navMobile={navMobile}
        >
          {children}
        </App3StorefrontLayout>
      </StorefrontMarketingShell>
    );
  }

  return (
    <StorefrontMarketingShell settings={marketing}>
      {structuredData}
      <App1StorefrontLayout
        storeDisplayName={displayName}
        config={config}
        brandPrimary={brandPrimary}
        wishlistEnabled={wishlistEnabled}
        promo2x1Active={promo2x1Active}
        navDesktop={navDesktop}
        navMobile={navMobile}
      >
        {children}
      </App1StorefrontLayout>
    </StorefrontMarketingShell>
  );
}
