import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { formatStoreName, getStore } from "@/lib/store-context";
import { resolveHomePage } from "@/lib/store-verticals/home-page";
import { getStoreVertical } from "@/lib/store-verticals";

export const revalidate = STOREFRONT_CATALOG_REVALIDATE_SECONDS;

export default async function HomePage() {
  const store = await getStore();
  const vertical = getStoreVertical();
  const storeDisplayName = formatStoreName(store.name);
  const Home = resolveHomePage(vertical);

  return <Home storeDisplayName={storeDisplayName} />;
}
