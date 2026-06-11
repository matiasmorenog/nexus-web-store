import { Suspense } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductFilters } from "@/components/storefront/product-filters";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { db } from "@/lib/db";
import { getStoreId } from "@/lib/store-context";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  categoria?: string;
  talle?: string;
  precioMax?: string;
  q?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const storeId = await getStoreId();

  const where: Prisma.ProductWhereInput = { storeId };

  if (params.categoria) {
    where.category = params.categoria;
  }

  const searchQuery = params.q?.trim();
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { category: { contains: searchQuery, mode: "insensitive" } },
      {
        variants: {
          some: {
            OR: [
              { sku: { contains: searchQuery, mode: "insensitive" } },
              { color: { contains: searchQuery, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  if (params.talle) {
    where.variants = { some: { size: params.talle, stock: { gt: 0 } } };
  }

  if (params.precioMax) {
    where.variants = {
      ...(where.variants as Prisma.ProductVariantListRelationFilter),
      some: {
        ...(where.variants as Prisma.ProductVariantListRelationFilter)?.some,
        price: { lte: parseInt(params.precioMax) },
        stock: { gt: 0 },
      },
    };
  }

  const products = await db.product.findMany({
    where,
    include: {
      variants: {
        where: { stock: { gt: 0 } },
        orderBy: { price: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <StorefrontPageHeader
        title="Productos"
        description={
          searchQuery
            ? `Resultados para “${searchQuery}”`
            : "Explorá el catálogo completo de Alaska Indumentaria."
        }
      />

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <Suspense
          fallback={
            <div className="h-72 animate-pulse rounded-xl bg-neutral-100" />
          }
        >
          <ProductFilters />
        </Suspense>
        <div>
          <p className="mb-4 text-sm text-neutral-500">
            {products.length} producto{products.length !== 1 ? "s" : ""}
          </p>
          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-[var(--brand-primary-soft)]/40 px-6 py-16 text-center">
              <p className="font-medium text-neutral-900">
                No se encontraron productos
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Probá con otros filtros o una búsqueda distinta.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  name={product.name}
                  category={product.category}
                  imageUrl={product.variants[0]?.imageUrl ?? ""}
                  price={Number(product.variants[0]?.price ?? 0)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
