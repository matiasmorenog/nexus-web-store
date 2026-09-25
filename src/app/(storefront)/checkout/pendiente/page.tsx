import { Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { CheckoutWhatsAppCta } from "@/components/storefront/checkout-whatsapp-cta";
import { StorefrontStatusPage } from "@/components/storefront/storefront-status-page";
import { getStorefrontPaths } from "@/lib/storefront-paths";
import { getLocaleCopy } from "@/lib/storefront-locale-copy";
import { getStorefrontConfig } from "@/lib/store-verticals";
import { db } from "@/lib/db";
import { formatOrderId } from "@/lib/order-status";
import { getStoreId } from "@/lib/store-context";
import { formatPrice } from "@/lib/utils";
import { getStoreMarketingSettings } from "@/lib/marketing/query";

export const dynamic = "force-dynamic";

export default async function CheckoutPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const config = getStorefrontConfig();
  if (!config.features.checkout) {
    redirect(getStorefrontPaths().contact);
  }

  const copy = getLocaleCopy(config.locale);
  const params = await searchParams;
  const storeId = await getStoreId();
  const marketing = await getStoreMarketingSettings(storeId);

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

  const belongsToStore = order?.storeId === storeId;
  const isTransferOrder = belongsToStore && order.paymentMethod === "TRANSFER";
  const isCashOrder = belongsToStore && order.paymentMethod === "CASH";
  const preferWhatsApp = isTransferOrder || isCashOrder || config.features.pickupOnly;

  const transferInstructions = isTransferOrder
    ? (
        await db.storePaymentSettings.findUnique({
          where: { storeId },
          select: { transferInstructions: true },
        })
      )?.transferInstructions
    : null;

  const whatsappPhone =
    marketing.whatsappEnabled && marketing.whatsappPhone
      ? marketing.whatsappPhone
      : null;

  return (
    <StorefrontStatusPage
      icon={Clock}
      iconClassName="text-amber-600"
      title={
        isTransferOrder || isCashOrder ? copy.orderRegistered : copy.paymentPending
      }
      actionHref="/"
      actionLabel={copy.backHome}
      actionVariant="secondary"
    >
      {isCashOrder ? (
        <>
          <p>{copy.cashPending}</p>
          {order ? (
            <p>
              {copy.orderNumber}{" "}
              <strong className="text-neutral-900">{formatOrderId(order.id)}</strong>
            </p>
          ) : null}
          <p>
            {copy.cashTotal}{" "}
            <strong className="text-neutral-900">
              {order ? formatPrice(Number(order.total)) : "—"}
            </strong>
          </p>
        </>
      ) : isTransferOrder ? (
        <>
          <p>{copy.transferPending}</p>
          {order ? (
            <p>
              {copy.orderNumber}{" "}
              <strong className="text-neutral-900">{formatOrderId(order.id)}</strong>
            </p>
          ) : null}
          <p>
            {copy.transferTotal}{" "}
            <strong className="text-neutral-900">
              {order ? formatPrice(Number(order.total)) : "—"}
            </strong>
          </p>
          {transferInstructions ? (
            <div className="mx-auto mt-4 max-w-md storefront-card border border-amber-200 bg-amber-50 px-4 py-4 text-left text-sm">
              <p className="font-medium text-neutral-900">{copy.transferDetails}</p>
              <p className="mt-2 whitespace-pre-line text-neutral-700">
                {transferInstructions}
              </p>
              <p className="mt-3 text-xs text-neutral-500">{copy.transferProof}</p>
            </div>
          ) : null}
        </>
      ) : (
        <p>{copy.paymentProcessing}</p>
      )}

      {preferWhatsApp ? (
        <CheckoutWhatsAppCta
          phone={whatsappPhone}
          message={marketing.whatsappMessage}
          orderId={order?.id}
          copy={copy}
        />
      ) : null}
    </StorefrontStatusPage>
  );
}
