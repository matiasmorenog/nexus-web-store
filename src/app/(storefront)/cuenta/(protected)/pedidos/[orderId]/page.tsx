import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { getCustomerOrderById } from "@/lib/customer-orders";
import { requireCustomerSession } from "@/lib/customer-session";
import {
  formatOrderId,
  getOrderStatusLabel,
  getOrderStatusVariant,
} from "@/lib/order-status";
import { getVariantLabels } from "@/lib/variant-labels";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function CustomerOrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;
  const session = await requireCustomerSession();
  const order = await getCustomerOrderById(
    orderId,
    session.user.id,
    session.user.email ?? "",
  );
  const variantLabels = getVariantLabels();

  return (
    <>
      <StorefrontPageHeader
        title={`Pedido #${formatOrderId(order.id)}`}
        description={new Date(order.createdAt).toLocaleString("es-AR")}
        backHref="/cuenta/pedidos"
        backLabel="Mis pedidos"
      />

      <div className="mt-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={getOrderStatusVariant(order.status)}>
            {getOrderStatusLabel(order.status)}
          </Badge>
          <p className="text-xl font-bold tabular-nums text-neutral-900">
            {formatPrice(Number(order.total))}
          </p>
        </div>

        <section className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Productos
          </h2>
          <ul className="mt-4 divide-y divide-neutral-100">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {item.variant.product.name}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {variantLabels.secondary}: {item.variant.size} ·{" "}
                    {variantLabels.primary}: {item.variant.color}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <p className="font-medium tabular-nums text-neutral-900">
                  {formatPrice(Number(item.unitPrice) * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Entrega
            </h2>
            {order.isPickup ? (
              <p className="mt-3 text-sm text-neutral-700">
                Retiro en local — {order.shippingCity}
              </p>
            ) : (
              <p className="mt-3 text-sm text-neutral-700">
                {order.shippingAddress}
                <br />
                {order.shippingCity} ({order.shippingZip})
              </p>
            )}
            <p className="mt-2 text-sm text-neutral-600">
              {order.shipping.statusLabel}
            </p>
            {order.shipping.trackingUrl ? (
              <Link
                href={order.shipping.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-[var(--brand-primary)] hover:underline"
              >
                Seguir envío
              </Link>
            ) : null}
          </div>

          <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Pago
            </h2>
            <p className="mt-3 text-sm text-neutral-700">{order.payment.provider}</p>
            <p className="text-sm text-neutral-600">{order.payment.statusLabel}</p>
            {order.payment.detail ? (
              <p className="mt-1 text-sm text-neutral-500">{order.payment.detail}</p>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
