import type { ReactNode } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { db } from "@/lib/db";
import { getStoreId } from "@/lib/store-context";
import { getProductCardImages, partitionVariantsForCard } from "@/lib/variant-images";

export async function FeaturedProductsSection() {
  const storeId = await getStoreId();

  const featuredProducts = await db.product.findMany({
    where: { storeId, featured: true },
    include: {
      variants: {
        orderBy: { price: "asc" },
        select: { color: true, imageUrl: true, price: true, stock: true },
      },
    },
    take: 8,
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
      {featuredProducts.map((product) => {
        const { inStock, displayVariants } = partitionVariantsForCard(
          product.variants,
        );
        const cardImages = getProductCardImages(displayVariants);

        return (
        <ProductCard
          key={product.id}
          slug={product.slug}
          name={product.name}
          category={product.category}
          audience={product.audience}
          imageUrl={cardImages.imageUrl}
          hoverImageUrl={cardImages.hoverImageUrl}
          price={cardImages.price}
          inStock={inStock}
        />
        );
      })}
    </div>
  );
}

export function FeaturedProductsSectionShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-neutral-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-bold">
            <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">
              Destacados del box
            </span>
          </h2>
          <Link
            href="/productos"
            className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
          >
            Ver todos
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}
