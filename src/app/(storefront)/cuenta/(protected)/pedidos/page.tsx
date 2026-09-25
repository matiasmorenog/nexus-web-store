import Link from "next/link";
import { CustomerOrderCard } from "@/components/storefront/customer-order-card";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { getCustomerOrders } from "@/lib/customer-orders";
import { requireCustomerSession } from "@/lib/customer-session";
import { Button } from "@/components/ui/button";
import { getLocaleCopy } from "@/lib/storefront-locale-copy";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const session = await requireCustomerSession();
  const orders = await getCustomerOrders(
    session.user.id,
    session.user.email ?? "",
  );

  const copy = getLocaleCopy();

  return (
    <>
      <StorefrontPageHeader
        variant="account"
        title={copy.ordersTitle}
        description={copy.ordersDescription}
      />

      {orders.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-medium text-neutral-900">{copy.noOrders}</p>
          <p className="mt-2 text-sm text-neutral-500">{copy.noOrdersHint}</p>
          <Link href="/" className="mt-5 inline-block">
            <Button>{copy.goToStore}</Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <CustomerOrderCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
