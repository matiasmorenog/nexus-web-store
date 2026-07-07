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
import { storeHasModule } from "@/lib/modules";
import { formatStoreName, getStore, getStoreId } from "@/lib/store-context";
import { getStorefrontConfig } from "@/lib/store-verticals";
import { ApparelStorefrontLayout } from "@/themes/apparel/components/storefront-layout";
import { VapeStorefrontLayout } from "@/themes/vape/components/storefront-layout";

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
      />
    ) : null;
  const wishlistEnabled = await storeHasModule(store.id, "wishlist");
  const marketing = await getStoreMarketingSettings(storeId);

  if (config.ui.id === "vape") {
    return (
      <StorefrontMarketingShell settings={marketing}>
        {structuredData}
        <VapeStorefrontLayout
          storeDisplayName={displayName}
          config={config}
          wishlistEnabled={wishlistEnabled}
        >
          {children}
        </VapeStorefrontLayout>
      </StorefrontMarketingShell>
    );
  }

  return (
    <StorefrontMarketingShell settings={marketing}>
      {structuredData}
      <ApparelStorefrontLayout
        storeDisplayName={displayName}
        config={config}
        brandPrimary={brandPrimary}
        wishlistEnabled={wishlistEnabled}
      >
        {children}
      </ApparelStorefrontLayout>
    </StorefrontMarketingShell>
  );
}
