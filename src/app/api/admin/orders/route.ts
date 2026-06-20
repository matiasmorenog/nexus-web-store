import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminOrdersPage } from "@/lib/admin-orders-query";

export async function GET(request: NextRequest) {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const estado = searchParams.get("estado") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const desde = searchParams.get("desde") ?? undefined;
  const hasta = searchParams.get("hasta") ?? undefined;

  try {
    const result = await getAdminOrdersPage(storeId, page, {
      estado,
      q,
      desde,
      hasta,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin orders page error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los pedidos" },
      { status: 500 },
    );
  }
}
