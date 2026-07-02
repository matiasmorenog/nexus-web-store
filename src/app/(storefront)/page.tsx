import { formatStoreName, getStore } from "@/lib/store-context";
import { resolveHomePage } from "@/lib/store-verticals/home-page";
import { getStorefrontKind } from "@/lib/store-verticals";

/** ISR storefront — mantener en sync con STOREFRONT_CATALOG_REVALIDATE_SECONDS en cache-ttl.ts */
export const revalidate = 600;

export default async function HomePage() {
  const store = await getStore();
  const storefrontKind = getStorefrontKind();
  const storeDisplayName = formatStoreName(store.name);
  const Home = resolveHomePage(storefrontKind);

  return <Home storeDisplayName={storeDisplayName} />;
}
