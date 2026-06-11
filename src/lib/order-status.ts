export const ORDER_STATUS_VARIANT = {
  PENDING: "warning",
  PAID: "success",
  SHIPPED: "default",
  CANCELLED: "danger",
} as const;

export const ORDER_STATUS_LABEL = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  CANCELLED: "Cancelado",
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_LABEL;

export const ORDER_STATUSES = Object.keys(
  ORDER_STATUS_LABEL,
) as OrderStatus[];

export function getOrderStatusLabel(status: string) {
  return ORDER_STATUS_LABEL[status as OrderStatus] ?? status;
}

export function getOrderStatusVariant(status: string) {
  return ORDER_STATUS_VARIANT[status as OrderStatus] ?? "default";
}

export function formatOrderId(orderId: string) {
  return orderId.slice(-8).toUpperCase();
}
