import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  buildAdminOrdersWhere,
  parseAdminOrdersUrlParams,
  resolveAdminOrdersFilters,
} from "@/lib/admin-orders-query";
import { buildOrdersCsv, csvAttachmentFilename } from "@/lib/exports";
import { db } from "@/lib/db";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

const MAX_EXPORT_ROWS = 10_000;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await assertModule("exports");

    const storeId = await getStoreId();
    const filters = resolveAdminOrdersFilters(
      parseAdminOrdersUrlParams(request.nextUrl.searchParams),
    );

    const orders = await db.order.findMany({
      where: buildAdminOrdersWhere(storeId, filters),
      orderBy: { createdAt: "desc" },
      take: MAX_EXPORT_ROWS,
      select: {
        id: true,
        createdAt: true,
        status: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        isPickup: true,
        shippingCity: true,
        shippingZip: true,
        promoDiscount: true,
        couponCode: true,
        couponDiscount: true,
        shippingCost: true,
        total: true,
        _count: { select: { items: true } },
      },
    });

    const csv = buildOrdersCsv(
      orders.map((order) => ({
        ...order,
        itemsCount: order._count.items,
      })),
    );

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${csvAttachmentFilename("pedidos")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const moduleResponse = moduleErrorResponse(error);
    if (moduleResponse) return moduleResponse;

    console.error("Orders export error:", error);
    return NextResponse.json(
      { error: "No se pudo exportar los pedidos." },
      { status: 500 },
    );
  }
}
