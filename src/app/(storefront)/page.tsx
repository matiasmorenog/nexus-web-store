import { formatStoreName, getStore } from "@/lib/store-context";
import { getStorefrontKind } from "@/lib/store-verticals";
import { App1Home } from "@/themes/app1/components/app1-home";
import { App2Home } from "@/themes/app2/components/app2-home";

/** ISR storefront — mantener en sync con STOREFRONT_CATALOG_REVALIDATE_SECONDS en cache-ttl.ts */
export const revalidate = 600;

export default async function HomePage() {
  const store = await getStore();
  const storefrontKind = getStorefrontKind();
  const storeDisplayName = formatStoreName(store.name);

  if (storefrontKind === "app2") {
    return <App2Home storeDisplayName={storeDisplayName} />;
  }

  return <App1Home storeDisplayName={storeDisplayName} />;
}
