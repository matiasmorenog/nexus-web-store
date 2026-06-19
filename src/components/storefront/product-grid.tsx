import { ProductCard } from "@/components/storefront/product-card";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { buildCatalogProductWhere } from "@/lib/catalog-query";
import { db } from "@/lib/db";
import { parseProductSort, sortProducts } from "@/lib/product-sort";
import { getProductSalesTotals } from "@/lib/product-sales";
import { getStoreId } from "@/lib/store-context";
import { getProductCardImages, partitionVariantsForCard } from "@/lib/variant-images";

export type ProductGridParams = {
  categoria?: string;
  genero?: string;
  talle?: string;
  precioMax?: string;
  q?: string;
  orden?: string;
};

export function productGridQueryKey(params: ProductGridParams) {
  return [
    params.categoria ?? "",
    params.genero ?? "",
    params.talle ?? "",
    params.precioMax ?? "",
    params.q?.trim() ?? "",
    params.orden ?? "",
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

  const where = buildCatalogProductWhere({
    storeId,
    categoria: params.categoria,
    genero: params.genero,
    talle: params.talle,
    precioMax: params.precioMax,
    q: params.q,
  });

  const sort = parseProductSort(params.orden);
  const salesTotals =
    sort === "mas-vendidos" ? await getProductSalesTotals(storeId) : undefined;

  const products = await db.product.findMany({
    where,
    include: {
      variants: {
        orderBy: { price: "asc" },
        select: { color: true, imageUrl: true, price: true, stock: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const sortedProducts = sortProducts(products, sort, salesTotals);

  return (
    <>
      {sortedProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-[var(--brand-primary-soft)]/40 px-6 py-16 text-center">
          <p className="font-medium text-neutral-900">No se encontraron productos</p>
          <p className="mt-2 text-sm text-neutral-500">
            Probá con otros filtros o una búsqueda distinta.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4 xl:gap-6">
          {sortedProducts.map((product, index) => {
            const { inStock, displayVariants } = partitionVariantsForCard(
              product.variants,
            );
            const cardImages = getProductCardImages(displayVariants);

            return (
            <StorefrontReveal key={product.id} index={Math.min(index, 8)}>
              <ProductCard
                slug={product.slug}
                name={product.name}
                category={product.category}
                audience={product.audience}
                imageUrl={cardImages.imageUrl}
                hoverImageUrl={cardImages.hoverImageUrl}
                price={cardImages.price}
                inStock={inStock}
              />
            </StorefrontReveal>
            );
          })}
        </div>
      )}
    </>
  );
}
