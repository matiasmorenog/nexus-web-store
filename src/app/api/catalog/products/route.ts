import { NextRequest, NextResponse } from "next/server";
import {
  getCatalogProductsPage,
  type CatalogProductsFilterParams,
} from "@/lib/catalog-products-query";
import { getStoreId } from "@/lib/store-context";

function parseCatalogFilters(
  searchParams: URLSearchParams,
): CatalogProductsFilterParams {
  return {
    categoria: searchParams.get("categoria") ?? undefined,
    genero: searchParams.get("genero") ?? undefined,
    talle: searchParams.get("talle") ?? undefined,
    precioMax: searchParams.get("precioMax") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    orden: searchParams.get("orden") ?? undefined,
    promo: searchParams.get("promo") ?? undefined,
    destacados: searchParams.get("destacados") ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );
  const filters = parseCatalogFilters(searchParams);

  try {
    const storeId = await getStoreId();
    const result = await getCatalogProductsPage(storeId, page, filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Catalog products page error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los productos" },
      { status: 500 },
    );
  }
}
