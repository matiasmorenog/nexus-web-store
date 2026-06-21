export type OrderPaymentInfo = {
  provider: string;
  statusLabel: string;
  detail?: string;
};

type OrderPaymentInput = {
  status: string;
  mpPaymentId: string | null;
  mpPreferenceId: string | null;
};

export function getOrderPaymentInfo(order: OrderPaymentInput): OrderPaymentInfo {
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
