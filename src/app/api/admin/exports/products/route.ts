import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildProductsCsv, csvAttachmentFilename } from "@/lib/exports";
import { db } from "@/lib/db";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

const MAX_EXPORT_ROWS = 10_000;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await assertModule("analytics");

    const storeId = await getStoreId();

    const products = await db.product.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: MAX_EXPORT_ROWS,
      select: {
        name: true,
        slug: true,
        category: true,
        audience: true,
        featured: true,
        promo2x1: true,
        variants: {
          orderBy: [{ size: "asc" }, { color: "asc" }],
          select: {
            size: true,
            color: true,
            sku: true,
            stock: true,
            price: true,
          },
        },
      },
    });

    const csv = buildProductsCsv(products);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${csvAttachmentFilename("productos")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const moduleResponse = moduleErrorResponse(error);
    if (moduleResponse) return moduleResponse;

    console.error("Products export error:", error);
    return NextResponse.json(
      { error: "No se pudo exportar los productos." },
      { status: 500 },
    );
  }
}
