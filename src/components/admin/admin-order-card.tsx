import {
  formatOrderId,
  getOrderStatusLabel,
  getOrderStatusVariant,
} from "@/lib/order-status";
import { formatTaxIdDisplay, getInvoiceStatusLabel } from "@/lib/afip";
import type { InvoiceStatus } from "@prisma/client";
import type { OrderPaymentInfo } from "@/lib/order-payment";
import type { OrderShippingInfo } from "@/lib/order-shipping";
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
  customerTaxId: string | null;
  invoiceStatus: InvoiceStatus;
  invoiceNumber: string | null;
  invoiceCae: string | null;
  invoicedAt: Date | null;
  invoiceError: string | null;
  isPickup: boolean;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  createdAt: Date;
  payment: OrderPaymentInfo;
  shipping: OrderShippingInfo;
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
            {order.customerTaxId ? (
              <p className="text-neutral-500">
                CUIT/DNI: {formatTaxIdDisplay(order.customerTaxId)}
              </p>
            ) : null}
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
          <AdminDetailField label="Facturación">
            <p>{getInvoiceStatusLabel(order.invoiceStatus)}</p>
            {order.invoiceNumber ? (
              <p className="text-neutral-600">
                Nº {order.invoiceNumber}
                {order.invoiceCae ? ` · CAE ${order.invoiceCae}` : ""}
              </p>
            ) : null}
            {order.invoicedAt ? (
              <p className="text-neutral-500">
                {new Date(order.invoicedAt).toLocaleString("es-AR")}
              </p>
            ) : null}
            {order.invoiceError ? (
              <p className="text-red-600">{order.invoiceError}</p>
            ) : null}
          </AdminDetailField>
          <AdminDetailField label="Envío">
            <p>{order.shipping.provider}</p>
            <p className="text-neutral-700">{order.shipping.statusLabel}</p>
            {order.shipping.trackingNumber ? (
              <>
                <p className="font-mono text-sm text-neutral-600">
                  {order.shipping.trackingNumber}
                </p>
                {order.shipping.carrier ? (
                  <p className="text-neutral-500">{order.shipping.carrier}</p>
                ) : null}
                {order.shipping.trackingUrl ? (
                  <a
                    href={order.shipping.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#3483fa] hover:underline"
                  >
                    {order.shipping.trackingPortalLabel ?? "Rastrear envío"} →
                  </a>
                ) : null}
              </>
            ) : order.shipping.detail ? (
              <p className="text-neutral-500">{order.shipping.detail}</p>
            ) : null}
            {order.shipping.estimatedDelivery ? (
              <p className="text-neutral-500">
                Entrega estimada: {order.shipping.estimatedDelivery}
              </p>
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
