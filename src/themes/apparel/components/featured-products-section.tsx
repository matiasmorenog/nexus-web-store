import type { ReactNode } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { getBrandPrefix } from "@/lib/brand";
import { getFeaturedProducts } from "@/lib/featured-products-query";
import { getStoreId } from "@/lib/store-context";

export async function FeaturedProductsSection() {
  const storeId = await getStoreId();
  const featuredProducts = await getFeaturedProducts(storeId);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5">
      {featuredProducts.map((product) => (
        <ProductCard
          key={product.id}
          slug={product.slug}
          name={product.name}
          category={product.category}
          audience={product.audience}
          imageUrl={product.imageUrl}
          hoverImageUrl={product.hoverImageUrl}
          price={product.price}
          inStock={product.inStock}
          promo2x1={product.promo2x1}
        />
      ))}
    </div>
  );
}

export function FeaturedProductsSectionShell({
  storeDisplayName,
  children,
}: {
  storeDisplayName: string;
  children: ReactNode;
}) {
  return (
    <StorefrontReveal index={1}>
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold">
              <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">
                Destacados
              </span>{" "}
              <span className="text-[var(--brand-primary)]">
                {getBrandPrefix(storeDisplayName)}
              </span>
            </h2>
            <Link
              href="/productos?destacados=1"
              className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
            >
              Ver todos
            </Link>
          </div>
          {children}
        </div>
      </section>
    </StorefrontReveal>
  );
}
