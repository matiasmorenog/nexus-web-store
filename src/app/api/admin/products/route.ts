import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAdminProductsPage,
  type AdminProductsFilterParams,
} from "@/lib/admin-products-query";

function parseProductFilters(
  searchParams: URLSearchParams,
): AdminProductsFilterParams {
  return {
    q: searchParams.get("q") ?? undefined,
    categoria: searchParams.get("categoria") ?? undefined,
    genero: searchParams.get("genero") ?? undefined,
    estado: searchParams.get("estado") ?? undefined,
    orden: searchParams.get("orden") ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );
  const filters = parseProductFilters(searchParams);

  try {
    const result = await getAdminProductsPage(storeId, page, filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin products page error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los productos" },
      { status: 500 },
    );
  }
}
