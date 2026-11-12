import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { createOrderShipment } from "@/lib/orders/create-order-shipment";
import { revalidateAdminOrderDataCaches } from "@/lib/revalidate-admin-cache";
import { getStoreId } from "@/lib/store-context";

export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    await requireAdminPermission("orders:manage");
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const storeId = await getStoreId();
  const { orderId } = await context.params;
  const order = await db.order.findFirst({
    where: { id: orderId, storeId },
    select: {
      id: true,
      storeId: true,
      status: true,
      isPickup: true,
      shippingZip: true,
      shippingAddress: true,
      shippingCity: true,
      shippingCarrierId: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      total: true,
      meShipmentId: true,
      shippingExternalId: true,
      items: { select: { quantity: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  if (order.isPickup) {
    return NextResponse.json(
      { error: "Este pedido es retiro en local." },
      { status: 400 },
    );
  }

  if (order.status !== "PAID" && order.status !== "SHIPPED") {
    return NextResponse.json(
      { error: "Solo se puede generar envío en pedidos pagados." },
      { status: 400 },
    );
  }

  try {
    const result = await createOrderShipment({
      id: order.id,
      storeId: order.storeId,
      isPickup: order.isPickup,
      shippingZip: order.shippingZip,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingCarrierId: order.shippingCarrierId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      total: Number(order.total),
      meShipmentId: order.meShipmentId,
      shippingExternalId: order.shippingExternalId,
      items: order.items,
    });

    if (!result.created) {
      return NextResponse.json(
        { error: "El envío ya existe o el módulo no está activo." },
        { status: 400 },
      );
    }

    revalidateAdminOrderDataCaches(storeId);
    return NextResponse.json({ ok: true, shipment: result.shipment });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo generar el envío.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
