import { getStoreAfipSettings } from "@/lib/afip/settings";
import { db } from "@/lib/db";

/**
 * Encola facturación AFIP cuando la tienda tiene el módulo habilitado.
 * La llamada al WS de AFIP se implementará en una fase posterior (NEX-6).
 */
export async function queueAfipInvoiceForPaidOrder(
  orderId: string,
): Promise<"PENDING" | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, storeId: true, invoiceStatus: true },
  });

  if (!order || order.invoiceStatus !== "NONE") {
    return null;
  }

  const settings = await getStoreAfipSettings(order.storeId);
  if (!settings.enabled) {
    return null;
  }

  await db.order.update({
    where: { id: orderId },
    data: { invoiceStatus: "PENDING" },
  });

  console.info(
    `[AFIP] Order ${orderId} queued for invoicing (${settings.environment}, PV ${settings.puntoVenta}) — WS pending`,
  );

  return "PENDING";
}
