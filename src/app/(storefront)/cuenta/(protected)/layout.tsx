import { CustomerAccountShell } from "@/components/storefront/customer-account-shell";
import { getCustomerAuthCallbackFromHeaders } from "@/lib/customer-auth-redirect";
import { requireCustomerSession } from "@/lib/customer-session";
import { storeHasModule } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

export default async function CustomerAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const callbackPath = await getCustomerAuthCallbackFromHeaders();
  const session = await requireCustomerSession(callbackPath);
  const storeId = await getStoreId();
  const wishlistEnabled = await storeHasModule(storeId, "wishlist");

  const displayName = session.user.name ?? session.user.email ?? "Mi cuenta";

  return (
    <CustomerAccountShell
      displayName={displayName}
      email={session.user.name ? session.user.email : null}
      wishlistEnabled={wishlistEnabled}
    >
      {children}
    </CustomerAccountShell>
  );
}
