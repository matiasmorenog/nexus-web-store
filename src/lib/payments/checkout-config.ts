import {
  TRANSFER_PAYMENT_DISCOUNT_RATE,
  transferPaymentDiscountLabel,
} from "@/lib/payments/transfer";
import type { CheckoutPaymentConfig } from "@/lib/payments/types";
import { db } from "@/lib/db";

export { transferPaymentDiscountLabel, TRANSFER_PAYMENT_DISCOUNT_RATE };

export async function getCheckoutPaymentConfig(
  storeId: string,
): Promise<CheckoutPaymentConfig> {
  const row = await db.storePaymentSettings.findUnique({
    where: { storeId },
    select: {
      transferEnabled: true,
      transferInstructions: true,
    },
  });

  const transferEnabled = row?.transferEnabled ?? false;
  const instructions = row?.transferInstructions?.trim() ?? "";

  return {
    showPaymentMethods: true,
    mercadopagoAvailable: true,
    transferAvailable: transferEnabled && instructions.length > 0,
    transferDiscountPercent: Math.round(TRANSFER_PAYMENT_DISCOUNT_RATE * 100),
    transferInstructions: transferEnabled && instructions ? instructions : null,
  };
}
