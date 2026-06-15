import { NextRequest, NextResponse } from "next/server";
import { getAdminProductVariants } from "@/lib/admin-product-variants-query";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ productId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { productId } = await context.params;

  try {
    const variants = await getAdminProductVariants(storeId, productId);
    return NextResponse.json({ variants });
  } catch (error) {
    console.error("Admin product variants error:", error);
    const message =
      error instanceof Error ? error.message : "No se pudieron cargar las variantes";
    const status = message === "Producto no encontrado" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
