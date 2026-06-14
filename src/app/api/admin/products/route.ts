import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminProductsPage } from "@/lib/admin-products-query";

export async function GET(request: NextRequest) {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const page = Math.max(
    1,
    parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10) || 1,
  );

  try {
    const result = await getAdminProductsPage(storeId, page);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin products page error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los productos" },
      { status: 500 },
    );
  }
}
