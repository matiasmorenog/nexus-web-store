import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  formatOrderId,
  getOrderStatusLabel,
  getOrderStatusVariant,
} from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";

type CustomerOrderListItem = {
  id: string;
  status: string;
  total: { toString(): string } | number;
  createdAt: Date;
  items: { quantity: number }[];
};

export function CustomerOrderCard({ order }: { order: CustomerOrderListItem }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      href={`/cuenta/pedidos/${order.id}`}
      className="block rounded-xl border border-neutral-200/90 bg-white p-5 shadow-sm transition-colors hover:border-[var(--brand-primary)]/40"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-neutral-900">
            Pedido #{formatOrderId(order.id)}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {new Date(order.createdAt).toLocaleString("es-AR")}
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            {itemCount} producto{itemCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-lg font-bold tabular-nums text-neutral-900">
            {formatPrice(Number(order.total))}
          </p>
          <Badge variant={getOrderStatusVariant(order.status)}>
            {getOrderStatusLabel(order.status)}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
