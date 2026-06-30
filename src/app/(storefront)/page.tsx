import { formatStoreName, getStore } from "@/lib/store-context";
import { resolveHomePage } from "@/lib/store-verticals/home-page";
import { getStoreVertical } from "@/lib/store-verticals";

/** ISR storefront — mantener en sync con STOREFRONT_CATALOG_REVALIDATE_SECONDS en cache-ttl.ts */
export const revalidate = 600;

export default async function HomePage() {
  const store = await getStore();
  const vertical = getStoreVertical();
  const storeDisplayName = formatStoreName(store.name);
  const Home = resolveHomePage(vertical);

  return <Home storeDisplayName={storeDisplayName} />;
}
