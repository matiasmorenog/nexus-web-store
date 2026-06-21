import { ProductGridSection } from "@/components/storefront/product-grid-section";
import { buildCatalogProductWhere } from "@/lib/catalog-query";
import { getCatalogProductsPage } from "@/lib/catalog-products-query";
import { db } from "@/lib/db";
import { getStoreId } from "@/lib/store-context";

export type ProductGridParams = {
  categoria?: string;
  genero?: string;
  talle?: string;
  precioMax?: string;
  q?: string;
  orden?: string;
  promo?: string;
  destacados?: string;
};

export function productGridQueryKey(params: ProductGridParams) {
  return [
    params.categoria ?? "",
    params.genero ?? "",
    params.talle ?? "",
    params.precioMax ?? "",
    params.q?.trim() ?? "",
    params.orden ?? "",
    params.promo ?? "",
    params.destacados ?? "",
  ].join("|");
}

export async function ProductGridCount({ params }: { params: ProductGridParams }) {
  const storeId = await getStoreId();

  const where = buildCatalogProductWhere({
    storeId,
    categoria: params.categoria,
    genero: params.genero,
    talle: params.talle,
    precioMax: params.precioMax,
    q: params.q,
    promo: params.promo,
    destacados: params.destacados,
  });

  const count = await db.product.count({ where });

  return (
    <p className="text-sm font-medium text-neutral-700">
      {count} producto{count !== 1 ? "s" : ""}
    </p>
  );
}

export async function ProductGrid({ params }: { params: ProductGridParams }) {
  const storeId = await getStoreId();
  const page = await getCatalogProductsPage(storeId, 1, params);

  return (
    <ProductGridSection
      initialProducts={page.products}
      total={page.total}
      hasMore={page.hasMore}
      params={params}
    />
  );
}
