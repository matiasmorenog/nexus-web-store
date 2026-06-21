import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAdminOrdersPage,
  parseAdminOrdersUrlParams,
  resolveAdminOrdersFilters,
} from "@/lib/admin-orders-query";

export async function GET(request: NextRequest) {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const filters = resolveAdminOrdersFilters(parseAdminOrdersUrlParams(searchParams));

  try {
    const result = await getAdminOrdersPage(storeId, page, filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin orders page error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los pedidos" },
      { status: 500 },
    );
  }
}
