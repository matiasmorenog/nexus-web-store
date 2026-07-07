import { notFound } from "next/navigation";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { WishlistPageClient } from "@/components/storefront/wishlist-page-client";
import { storeHasModule } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const storeId = await getStoreId();
  const enabled = await storeHasModule(storeId, "wishlist");

  if (!enabled) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <StorefrontPageHeader
        title="Favoritos"
        description="Productos guardados para comprar más tarde."
      />
      <WishlistPageClient />
    </div>
  );
}
