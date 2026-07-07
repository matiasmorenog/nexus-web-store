import { Suspense } from "react";
import type { Metadata } from "next";
import { formatStoreName, getStore } from "@/lib/store-context";
import { getStorefrontConfig } from "@/lib/store-verticals";
import { ApparelStorefrontLayout } from "@/themes/apparel/components/storefront-layout";
import { VapeStorefrontLayout } from "@/themes/vape/components/storefront-layout";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore();
  const config = getStorefrontConfig();
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
  const config = getStorefrontConfig();
  const displayName = formatStoreName(store.name);
  const brandPrimary =
    store.primaryColor?.trim() || config.ui.cssVars["--brand-primary"];

  if (config.ui.id === "vape") {
    return (
      <VapeStorefrontLayout storeDisplayName={displayName} config={config}>
        {children}
      </VapeStorefrontLayout>
    );
  }

  return (
    <ApparelStorefrontLayout
      storeDisplayName={displayName}
      config={config}
      brandPrimary={brandPrimary}
    >
      {children}
    </ApparelStorefrontLayout>
  );
}
