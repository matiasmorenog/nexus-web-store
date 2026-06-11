import { Suspense } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductFilters } from "@/components/storefront/product-filters";
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
      <h1 className="mb-2 text-3xl font-bold">
        <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">Productos</span>
      </h1>
      {searchQuery && (
        <p className="mb-8 text-sm text-neutral-500">
          Resultados para &ldquo;{searchQuery}&rdquo;
        </p>
      )}
      {!searchQuery && <div className="mb-8" />}
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-neutral-100" />}>
          <ProductFilters />
        </Suspense>
        <div>
          <p className="mb-4 text-sm text-neutral-500">
            {products.length} producto{products.length !== 1 ? "s" : ""}
          </p>
          {products.length === 0 ? (
            <p className="py-12 text-center text-neutral-500">
              No se encontraron productos con estos filtros.
            </p>
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
