"use client";

import { AdminSelect } from "@/components/admin/admin-form";
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
    <AdminSelect
      className="h-9 rounded-lg"
      value={currentStatus}
      onChange={(e) => updateOrderStatus(orderId, e.target.value)}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </AdminSelect>
  );
}
