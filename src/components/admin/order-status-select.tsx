"use client";

import { MenuSelect } from "@/components/ui/menu-select";
import { updateOrderStatus } from "@/lib/admin-actions";

const STATUSES = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID", label: "Pagado" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "CANCELLED", label: "Cancelado" },
] as const;

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  return (
    <MenuSelect
      className="min-w-[9rem]"
      aria-label="Estado del pedido"
      value={currentStatus}
      onChange={(next) => {
        void updateOrderStatus(orderId, next);
      }}
      options={STATUSES}
    />
  );
}
