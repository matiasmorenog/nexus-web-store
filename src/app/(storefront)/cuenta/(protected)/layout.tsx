import Link from "next/link";
import { CustomerSignOutButton } from "@/components/storefront/customer-sign-out-button";
import { requireCustomerSession } from "@/lib/customer-session";
import { storeHasModule } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

export default async function CustomerAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCustomerSession();
  const storeId = await getStoreId();
  const wishlistEnabled = await storeHasModule(storeId, "wishlist");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <p className="text-sm text-neutral-500">Mi cuenta</p>
          <p className="font-semibold text-neutral-900">
            {session.user.name ?? session.user.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/cuenta/pedidos"
            className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
          >
            Mis pedidos
          </Link>
          {wishlistEnabled ? (
            <Link
              href="/favoritos"
              className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
            >
              Favoritos
            </Link>
          ) : null}
          <CustomerSignOutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
