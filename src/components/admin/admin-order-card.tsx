import {
  formatOrderId,
  getOrderStatusLabel,
  getOrderStatusVariant,
} from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";
import { AdminCard } from "@/components/admin/admin-card";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Badge } from "@/components/ui/badge";

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: { toString(): string } | number;
  variant: {
    size: string;
    color: string;
    product: { name: string };
  };
};

export type AdminOrderCardData = {
  id: string;
  status: string;
  total: { toString(): string } | number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isPickup: boolean;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  createdAt: Date;
  items: OrderItem[];
};

export function AdminOrderCard({ order }: { order: AdminOrderCardData }) {
  return (
    <AdminCard
      padding={false}
      title={order.customerName}
      description={`#${formatOrderId(order.id)} · ${new Date(order.createdAt).toLocaleString("es-AR")}`}
      action={
        <div className="flex flex-col items-end gap-2">
          <p className="text-xl font-bold tracking-tight text-neutral-900">
            {formatPrice(Number(order.total))}
          </p>
          <Badge variant={getOrderStatusVariant(order.status)}>
            {getOrderStatusLabel(order.status)}
          </Badge>
        </div>
      }
    >
      <div className="grid gap-4 border-b border-neutral-100 px-4 py-4 text-sm sm:grid-cols-2 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Contacto
          </p>
          <p className="mt-1 text-neutral-700">{order.customerEmail}</p>
          <p className="text-neutral-500">{order.customerPhone}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Entrega
          </p>
          <p className="mt-1 text-neutral-700">
            {order.isPickup ? (
              <>
                <Badge variant="default" className="mr-2">
                  Retiro en local
                </Badge>
                {order.shippingCity}
              </>
            ) : (
              <>
                {order.shippingAddress}
                <br />
                {order.shippingCity} ({order.shippingZip})
              </>
            )}
          </p>
        </div>
      </div>

      <div className="admin-table-scroll">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50/80">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">
                Producto
              </th>
              <th className="px-6 py-3 text-left font-medium text-neutral-600">
                Cant.
              </th>
              <th className="px-6 py-3 text-right font-medium text-neutral-600">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {order.items.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50/50">
                <td className="px-6 py-4 font-medium text-neutral-900">
                  {item.variant.product.name}
                  <span className="mt-0.5 block text-xs font-normal text-neutral-500">
                    {item.variant.size} / {item.variant.color}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-700">×{item.quantity}</td>
                <td className="px-6 py-4 text-right font-medium">
                  {formatPrice(Number(item.unitPrice) * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 bg-neutral-50/50 px-4 py-3 sm:px-6">
        <p className="text-sm text-neutral-500">Cambiar estado del pedido</p>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>
    </AdminCard>
  );
}
