import { formatStoreName, getStore } from "@/lib/store-context";
import { getStorefrontKind } from "@/lib/store-verticals";
import { ApparelHome } from "@/themes/apparel/components/apparel-home";
import { VapeHome } from "@/themes/vape/components/vape-home";

/** ISR storefront — mantener en sync con STOREFRONT_CATALOG_REVALIDATE_SECONDS en cache-ttl.ts */
export const revalidate = 600;

export default async function HomePage() {
  const store = await getStore();
  const storefrontKind = getStorefrontKind();
  const storeDisplayName = formatStoreName(store.name);

  if (storefrontKind === "vape") {
    return <VapeHome storeDisplayName={storeDisplayName} />;
  }

  return <ApparelHome storeDisplayName={storeDisplayName} />;
}
