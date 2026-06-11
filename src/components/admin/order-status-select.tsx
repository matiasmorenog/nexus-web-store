"use client";

import { updateOrderStatus } from "@/lib/admin-actions";

const STATUSES = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID", label: "Pagado" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "CANCELLED", label: "Cancelado" },
];

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  return (
    <select
      value={currentStatus}
      onChange={(e) => updateOrderStatus(orderId, e.target.value)}
      className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
