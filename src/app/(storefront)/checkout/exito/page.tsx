import Link from "next/link";
import { CheckCircle, Truck } from "lucide-react";
import { StorefrontStatusPage } from "@/components/storefront/storefront-status-page";
import { db } from "@/lib/db";
import { getOrderShippingInfo } from "@/lib/order-shipping";
import { formatOrderId } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const order = params.order
    ? await db.order.findUnique({
        where: { id: params.order },
        select: {
          id: true,
          isPickup: true,
          meShipmentId: true,
          meTrackingNumber: true,
          meTrackingUrl: true,
          meCarrier: true,
          meStatus: true,
          meEstimatedDelivery: true,
          status: true,
        },
      })
    : null;

  const shipping = order
    ? getOrderShippingInfo(order)
    : null;

  return (
    <StorefrontStatusPage
      icon={CheckCircle}
      iconClassName="text-green-600"
      title="¡Compra confirmada!"
      actionHref="/productos"
      actionLabel="Seguir comprando"
    >
      <p>Tu pedido fue procesado correctamente.</p>
      {order ? (
        <p>
          Número de orden:{" "}
          <strong className="text-neutral-900">{formatOrderId(order.id)}</strong>
        </p>
      ) : null}
      {shipping?.trackingNumber ? (
        <div className="mx-auto mt-4 max-w-md rounded-xl border border-[#3483fa]/20 bg-[#3483fa]/5 px-4 py-4 text-left text-sm">
          <p className="flex items-center gap-2 font-medium text-neutral-900">
            <Truck className="size-4 text-[#3483fa]" aria-hidden />
            {shipping.provider}
          </p>
          <p className="mt-2 text-neutral-700">
            Estado: <strong>{shipping.statusLabel}</strong>
          </p>
          <p className="mt-1 font-mono text-sm text-neutral-800">
            {shipping.trackingNumber}
          </p>
          {shipping.carrier ? (
            <p className="mt-1 text-neutral-500">Transportista: {shipping.carrier}</p>
          ) : null}
          {shipping.estimatedDelivery ? (
            <p className="mt-1 text-neutral-500">
              Entrega estimada: {shipping.estimatedDelivery}
            </p>
          ) : null}
          {shipping.trackingUrl ? (
            <>
              <Link
                href={shipping.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block font-medium text-[#3483fa] hover:underline"
              >
                {shipping.trackingPortalLabel ?? "Rastrear envío"} →
              </Link>
              {shipping.trackingHint ? (
                <p className="mt-2 text-xs text-neutral-500">{shipping.trackingHint}</p>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
      <p>Te enviamos un email con el detalle de tu compra.</p>
    </StorefrontStatusPage>
  );
}
