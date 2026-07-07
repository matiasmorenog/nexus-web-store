import { getOrderStatusLabel } from "@/lib/order-status";
import { toCsvContent, toCsvRow } from "@/lib/exports/csv";

type OrderExportRow = {
  id: string;
  createdAt: Date;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isPickup: boolean;
  shippingCity: string;
  shippingZip: string;
  promoDiscount: { toString(): string } | number;
  couponCode: string | null;
  couponDiscount: { toString(): string } | number;
  shippingCost: { toString(): string } | number;
  total: { toString(): string } | number;
  itemsCount: number;
};

const ORDER_HEADERS = [
  "ID pedido",
  "Fecha",
  "Estado",
  "Cliente",
  "Email",
  "Teléfono",
  "Entrega",
  "Ciudad",
  "CP",
  "Ítems",
  "Promo 2x1",
  "Cupón",
  "Descuento cupón",
  "Envío",
  "Total",
] as const;

function formatExportDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function buildOrdersCsv(orders: OrderExportRow[]): string {
  const rows = [
    toCsvRow([...ORDER_HEADERS]),
    ...orders.map((order) =>
      toCsvRow([
        order.id,
        formatExportDate(order.createdAt),
        getOrderStatusLabel(order.status),
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.isPickup ? "Retiro en local" : "Envío",
        order.shippingCity,
        order.shippingZip,
        order.itemsCount,
        Number(order.promoDiscount),
        order.couponCode ?? "",
        Number(order.couponDiscount),
        Number(order.shippingCost),
        Number(order.total),
      ]),
    ),
  ];

  return toCsvContent(rows);
}
