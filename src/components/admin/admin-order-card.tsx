import {
  formatOrderId,
  getOrderStatusLabel,
  getOrderStatusVariant,
} from "@/lib/order-status";
import type { OrderPaymentInfo } from "@/lib/order-payment";
import { formatPrice } from "@/lib/utils";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminCardFooter,
  AdminCardSection,
  AdminDetailField,
  AdminDetailGrid,
} from "@/components/admin/admin-surface";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/admin/admin-table";
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
  payment: OrderPaymentInfo;
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
      <AdminCardSection className="text-sm">
        <AdminDetailGrid>
          <AdminDetailField label="Contacto">
            <p>{order.customerEmail}</p>
            <p className="text-neutral-500">{order.customerPhone}</p>
          </AdminDetailField>
          <AdminDetailField label="Entrega">
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
          </AdminDetailField>
          <AdminDetailField label="Pago">
            <p>{order.payment.provider}</p>
            <p className="text-neutral-700">{order.payment.statusLabel}</p>
            {order.payment.detail ? (
              <p className="text-neutral-500">{order.payment.detail}</p>
            ) : null}
          </AdminDetailField>
        </AdminDetailGrid>
      </AdminCardSection>

      <AdminDataTable
        columns={[
          "Producto",
          "Cant.",
          { label: "Subtotal", align: "right" },
        ]}
      >
        {order.items.map((item) => (
          <AdminTableRow key={item.id}>
            <AdminTableCell className="font-medium text-neutral-900">
              {item.variant.product.name}
              <span className="mt-0.5 block text-xs font-normal text-neutral-500">
                {item.variant.size} / {item.variant.color}
              </span>
            </AdminTableCell>
            <AdminTableCell className="text-neutral-700">
              ×{item.quantity}
            </AdminTableCell>
            <AdminTableCell align="right" className="font-medium">
              {formatPrice(Number(item.unitPrice) * item.quantity)}
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminDataTable>

      <AdminCardFooter>
        <p className="text-sm text-neutral-500">Cambiar estado del pedido</p>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </AdminCardFooter>
    </AdminCard>
  );
}
