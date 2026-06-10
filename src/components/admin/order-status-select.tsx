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
      className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
