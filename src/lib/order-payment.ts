import type { Decimal } from "@prisma/client/runtime/library";

export type OrderPaymentInfo = {
  provider: string;
  statusLabel: string;
  detail?: string;
};

import { transferPaymentDiscountLabel } from "@/lib/payments/transfer";

type OrderPaymentInput = {
  status: string;
  mpPaymentId: string | null;
  mpPreferenceId: string | null;
  paymentMethod?: "MERCADO_PAGO" | "TRANSFER";
  transferDiscount?: number | Decimal | null;
};

export function getOrderPaymentInfo(order: OrderPaymentInput): OrderPaymentInfo {
  if (order.paymentMethod === "TRANSFER") {
    const discount =
      order.transferDiscount != null ? Number(order.transferDiscount) : 0;

    if (order.status === "PAID" || order.status === "SHIPPED") {
      return {
        provider: "Transferencia",
        statusLabel: "Acreditado",
        detail: discount > 0 ? `Incluye descuento por transferencia` : undefined,
      };
    }

    if (order.status === "CANCELLED") {
      return {
        provider: "Transferencia",
        statusLabel: "Cancelado",
      };
    }

    return {
      provider: "Transferencia",
      statusLabel: "Pendiente de transferencia",
      detail:
        discount > 0
          ? `${transferPaymentDiscountLabel()} de descuento en productos`
          : "Esperando comprobante",
    };
  }

  const provider = "Mercado Pago";

  if (order.mpPaymentId) {
    return {
      provider,
      statusLabel: "Acreditado",
      detail: `Pago #${order.mpPaymentId}`,
    };
  }

  if (order.status === "CANCELLED") {
    return {
      provider,
      statusLabel: "No acreditado",
      detail: order.mpPreferenceId ? "Checkout iniciado" : undefined,
    };
  }

  if (order.status === "PENDING") {
    return {
      provider,
      statusLabel: "Pendiente de pago",
      detail: order.mpPreferenceId ? "Esperando pago en MP" : "Sin checkout",
    };
  }

  if (order.status === "PAID" || order.status === "SHIPPED") {
    return {
      provider,
      statusLabel: "Acreditado",
      detail: order.mpPreferenceId ? undefined : "Demo / sin ID de pago",
    };
  }

  return {
    provider,
    statusLabel: "Sin datos",
  };
}
