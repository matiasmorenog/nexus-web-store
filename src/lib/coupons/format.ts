export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function formatCouponTypeLabel(type: "PERCENTAGE" | "FIXED_AMOUNT"): string {
  return type === "PERCENTAGE" ? "Porcentaje" : "Monto fijo";
}

export function formatCouponValue(
  type: "PERCENTAGE" | "FIXED_AMOUNT",
  value: number,
): string {
  if (type === "PERCENTAGE") {
    return `${value}%`;
  }
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}
