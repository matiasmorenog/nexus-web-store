import { db } from "@/lib/db";
import { storeHidesMercadoPago } from "@/lib/modules";
import {
  TRANSFER_PAYMENT_DISCOUNT_RATE,
  transferDiscountPercentFor,
  transferPaymentDiscountLabel,
} from "@/lib/payments/transfer";
import type { CheckoutPaymentConfig } from "@/lib/payments/types";

export { transferPaymentDiscountLabel, TRANSFER_PAYMENT_DISCOUNT_RATE };

export async function getCheckoutPaymentConfig(
  storeId: string,
): Promise<CheckoutPaymentConfig> {
  const row = await db.storePaymentSettings.findUnique({
    where: { storeId },
    select: {
      transferEnabled: true,
      transferInstructions: true,
      transferDiscountEnabled: true,
      stripeEnabled: true,
      stripeSecretKeyEnc: true,
      stripeWebhookSecretEnc: true,
    },
  });

  const transferEnabled = row?.transferEnabled ?? false;
  const instructions = row?.transferInstructions?.trim() ?? "";
  const hideMp = storeHidesMercadoPago();
  const mercadopagoAvailable = !hideMp;
  const transferAvailable = transferEnabled && instructions.length > 0;
  const cashAvailable = hideMp;
  const cardAvailable = Boolean(
    row?.stripeEnabled && row.stripeSecretKeyEnc && row.stripeWebhookSecretEnc,
  );

  return {
    showPaymentMethods:
      mercadopagoAvailable || transferAvailable || cashAvailable || cardAvailable,
    mercadopagoAvailable,
    transferAvailable,
    cashAvailable,
    cardAvailable,
    transferDiscountPercent: transferDiscountPercentFor(
      row?.transferDiscountEnabled ?? true,
    ),
    transferInstructions: transferEnabled && instructions ? instructions : null,
  };
}
