import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  PAID: "success",
  SHIPPED: "default",
  CANCELLED: "danger",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  CANCELLED: "Cancelado",
};

export default async function AdminOrdersPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) return <p>No autorizado</p>;

  const orders = await db.order.findMany({
    where: { storeId },
    include: {
      items: {
        include: {
          variant: { include: { product: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Pedidos</h1>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="py-12 text-center text-neutral-500">No hay pedidos aún</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-lg border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="text-sm text-neutral-500">{order.customerEmail}</p>
                  <p className="text-sm text-neutral-500">{order.customerPhone}</p>
                  <p className="mt-2 text-sm">
                    {order.shippingAddress}, {order.shippingCity} ({order.shippingZip})
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {new Date(order.createdAt).toLocaleString("es-AR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatPrice(Number(order.total))}</p>
                  <Badge variant={statusVariant[order.status]} className="mt-1">
                    {statusLabel[order.status]}
                  </Badge>
                  <div className="mt-2">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </div>
                </div>
              </div>
              <ul className="mt-4 border-t pt-3 text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between py-1">
                    <span>
                      {item.variant.product.name} — {item.variant.size}/{item.variant.color} x{item.quantity}
                    </span>
                    <span>{formatPrice(Number(item.unitPrice) * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
