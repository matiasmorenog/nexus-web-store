import { Clock } from "lucide-react";
import { StorefrontStatusPage } from "@/components/storefront/storefront-status-page";
import { db } from "@/lib/db";
import { formatOrderId } from "@/lib/order-status";
import { getStoreId } from "@/lib/store-context";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const storeId = await getStoreId();

  const order = params.order
    ? await db.order.findUnique({
        where: { id: params.order },
        select: {
          id: true,
          storeId: true,
          total: true,
          paymentMethod: true,
          transferDiscount: true,
        },
      })
    : null;

  const isTransferOrder =
    order?.storeId === storeId && order.paymentMethod === "TRANSFER";

  const transferInstructions = isTransferOrder
    ? (
        await db.storePaymentSettings.findUnique({
          where: { storeId },
          select: { transferInstructions: true },
        })
      )?.transferInstructions
    : null;

  return (
    <StorefrontStatusPage
      icon={Clock}
      iconClassName="text-amber-600"
      title={isTransferOrder ? "Pedido registrado" : "Pago pendiente"}
      actionHref="/"
      actionLabel="Volver al inicio"
      actionVariant="secondary"
    >
      {isTransferOrder ? (
        <>
          <p>
            Tu pedido quedó pendiente hasta que confirmemos la transferencia.
          </p>
          {order ? (
            <p>
              Número de orden:{" "}
              <strong className="text-neutral-900">{formatOrderId(order.id)}</strong>
            </p>
          ) : null}
          <p>
            Total a transferir:{" "}
            <strong className="text-neutral-900">
              {order ? formatPrice(Number(order.total)) : "—"}
            </strong>
          </p>
          {transferInstructions ? (
            <div className="mx-auto mt-4 max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-left text-sm">
              <p className="font-medium text-neutral-900">Datos para transferir</p>
              <p className="mt-2 whitespace-pre-line text-neutral-700">
                {transferInstructions}
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Enviá el comprobante por WhatsApp o email indicando tu número de
                orden.
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <p>Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
      )}
    </StorefrontStatusPage>
  );
}
