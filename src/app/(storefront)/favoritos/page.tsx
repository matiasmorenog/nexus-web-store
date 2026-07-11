import { notFound } from "next/navigation";
import { CustomerAccountShell } from "@/components/storefront/customer-account-shell";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { WishlistPageClient } from "@/components/storefront/wishlist-page-client";
import { getOptionalCustomerSession } from "@/lib/customer-session";
import { storeHasModule } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const storeId = await getStoreId();
  const wishlistEnabled = await storeHasModule(storeId, "wishlist");

  if (!wishlistEnabled) {
    notFound();
  }

  const session = await getOptionalCustomerSession();
  const isCustomer = session?.user?.role === "CUSTOMER";

  const header = (
    <StorefrontPageHeader
      variant={isCustomer ? "account" : "default"}
      title="Favoritos"
      description="Productos guardados para comprar más tarde."
      {...(isCustomer
        ? {}
        : { backHref: "/", backLabel: "Volver a la tienda" })}
    />
  );

  const content = (
    <>
      {header}
      <WishlistPageClient layout={isCustomer ? "account" : "standalone"} />
    </>
  );

  if (isCustomer && session) {
    const displayName = session.user.name ?? session.user.email ?? "Mi cuenta";

    return (
      <CustomerAccountShell
        displayName={displayName}
        email={session.user.name ? session.user.email : null}
        wishlistEnabled={wishlistEnabled}
      >
        {content}
      </CustomerAccountShell>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {content}
    </div>
  );
}
