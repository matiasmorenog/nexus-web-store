import { formatStoreName } from "@/lib/brand";
import { formatPrice } from "@/lib/utils";

export type OrderEmailItem = {
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
};

export type OrderEmailData = {
  orderId: string;
  storeName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isPickup: boolean;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  items: OrderEmailItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  adminOrdersUrl: string;
};

export function buildOrderEmailData(order: {
  id: string;
  isPickup: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingCost: { toString(): string } | number;
  total: { toString(): string } | number;
  store: { name: string };
  items: Array<{
    quantity: number;
    unitPrice: { toString(): string } | number;
    variant: {
      size: string;
      color: string;
      product: { name: string };
    };
  }>;
}): OrderEmailData {
  const items = order.items.map((item) => ({
    name: item.variant.product.name,
    size: item.variant.size,
    color: item.variant.color,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
  }));

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    orderId: order.id,
    storeName: formatStoreName(order.store.name),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    isPickup: order.isPickup,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingZip: order.shippingZip,
    items,
    subtotal,
    shippingCost: Number(order.shippingCost),
    total: Number(order.total),
    adminOrdersUrl: `${appUrl}/admin/pedidos`,
  };
}

function renderItemsTable(data: OrderEmailData) {
  const rows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">
            ${item.name}<br>
            <span style="color:#666;font-size:13px;">${item.size} / ${item.color}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatPrice(item.unitPrice * item.quantity)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <thead>
        <tr style="color:#666;font-size:13px;">
          <th align="left" style="padding-bottom:8px;">Producto</th>
          <th align="center" style="padding-bottom:8px;">Cant.</th>
          <th align="right" style="padding-bottom:8px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderTotals(data: OrderEmailData) {
  return `
    <p style="margin:4px 0;"><strong>Subtotal:</strong> ${formatPrice(data.subtotal)}</p>
    <p style="margin:4px 0;"><strong>${data.isPickup ? "Entrega" : "Envío"}:</strong> ${data.isPickup ? "Sin costo (retiro en local)" : formatPrice(data.shippingCost)}</p>
    <p style="margin:8px 0 0;font-size:18px;"><strong>Total:</strong> ${formatPrice(data.total)}</p>
  `;
}

function renderDeliverySection(data: OrderEmailData) {
  if (data.isPickup) {
    return `
      <h2 style="font-size:16px;margin-top:24px;">Retiro en local</h2>
      <p style="margin:0;">
        ${data.shippingCity}<br>
        Tel: ${data.customerPhone}
      </p>
      <p style="margin-top:12px;color:#666;font-size:13px;">
        Te avisaremos por email cuando tu pedido esté listo para retirar.
      </p>
    `;
  }

  return `
    <h2 style="font-size:16px;margin-top:24px;">Envío a</h2>
    <p style="margin:0;">
      ${data.shippingAddress}<br>
      ${data.shippingCity}, CP ${data.shippingZip}<br>
      Tel: ${data.customerPhone}
    </p>
    <p style="margin-top:24px;color:#666;font-size:13px;">
      Te avisaremos cuando tu pedido sea despachado.
    </p>
  `;
}

export function buildCustomerConfirmationEmail(data: OrderEmailData) {
  const subject = `Confirmación de pedido #${data.orderId.slice(-8).toUpperCase()} — ${data.storeName}`;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#171717;">
      <h1 style="font-size:22px;margin-bottom:8px;">¡Gracias por tu compra!</h1>
      <p>Hola <strong>${data.customerName}</strong>, recibimos tu pedido en <strong>${data.storeName}</strong>.</p>
      <p style="color:#666;">Nº de pedido: <strong>${data.orderId}</strong></p>
      ${renderItemsTable(data)}
      ${renderTotals(data)}
      ${renderDeliverySection(data)}
    </div>
  `;

  const text = [
    `¡Gracias por tu compra en ${data.storeName}!`,
    `Pedido: ${data.orderId}`,
    "",
    ...data.items.map(
      (i) =>
        `- ${i.name} (${i.size}/${i.color}) x${i.quantity}: ${formatPrice(i.unitPrice * i.quantity)}`,
    ),
    "",
    `Subtotal: ${formatPrice(data.subtotal)}`,
    data.isPickup
      ? "Retiro en local: sin costo"
      : `Envío: ${formatPrice(data.shippingCost)}`,
    `Total: ${formatPrice(data.total)}`,
    "",
    data.isPickup
      ? `Retiro en local: ${data.shippingCity}`
      : `Envío a: ${data.shippingAddress}, ${data.shippingCity} CP ${data.shippingZip}`,
  ].join("\n");

  return { subject, html, text };
}

export function buildMerchantNotificationEmail(data: OrderEmailData) {
  const subject = `Nueva venta #${data.orderId.slice(-8).toUpperCase()} — ${formatPrice(data.total)}`;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#171717;">
      <h1 style="font-size:22px;margin-bottom:8px;">Nueva venta en ${data.storeName}</h1>
      <p>Pedido <strong>${data.orderId}</strong> — <strong>${formatPrice(data.total)}</strong>${data.isPickup ? " — <em>Retiro en local</em>" : ""}</p>
      <h2 style="font-size:16px;">Cliente</h2>
      <p style="margin:0;">
        ${data.customerName}<br>
        <a href="mailto:${data.customerEmail}">${data.customerEmail}</a><br>
        Tel: ${data.customerPhone}
      </p>
      ${renderItemsTable(data)}
      ${renderTotals(data)}
      <p style="margin-top:24px;">
        <a href="${data.adminOrdersUrl}" style="color:#f13489;">Ver pedidos en el admin →</a>
      </p>
    </div>
  `;

  const text = [
    `Nueva venta en ${data.storeName}`,
    `Pedido: ${data.orderId}`,
    `Total: ${formatPrice(data.total)}`,
    `Cliente: ${data.customerName} (${data.customerEmail})`,
    `Tel: ${data.customerPhone}`,
    `Admin: ${data.adminOrdersUrl}`,
  ].join("\n");

  return { subject, html, text };
}
