import Link from "next/link";
import { CustomerOrderCard } from "@/components/storefront/customer-order-card";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { getCustomerOrders } from "@/lib/customer-orders";
import { requireCustomerSession } from "@/lib/customer-session";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const session = await requireCustomerSession();
  const orders = await getCustomerOrders(
    session.user.id,
    session.user.email ?? "",
  );

  return (
    <>
      <StorefrontPageHeader
        title="Mis pedidos"
        description="Historial de compras en esta tienda."
        backHref="/"
        backLabel="Volver a la tienda"
      />

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 px-6 py-12 text-center">
          <p className="font-medium text-neutral-900">Todavía no tenés pedidos</p>
          <p className="mt-2 text-sm text-neutral-500">
            Cuando compres con este email, los vas a ver acá.
          </p>
          <Link href="/" className="mt-5 inline-block">
            <Button>Ir a la tienda</Button>
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
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
