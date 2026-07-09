import type { ReactNode } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { getBrandPrefix } from "@/lib/brand";
import { getFeaturedProducts } from "@/lib/featured-products-query";
import { isPromo2x1ActiveForStore } from "@/lib/promotions";
import { getStoreId } from "@/lib/store-context";
import { getStorefrontConfig } from "@/lib/store-verticals";

export async function FeaturedProductsSection() {
  const storeId = await getStoreId();
  const featuredProducts = await getFeaturedProducts(storeId);
  const promo2x1Active =
    getStorefrontConfig().features.promo2x1 &&
    (await isPromo2x1ActiveForStore(storeId));

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
          promo2x1={promo2x1Active && product.promo2x1}
        />
      ))}
    </div>
  );
}

export function FeaturedProductsSectionShell({
  storeDisplayName,
  title = "Destacados",
  titleAccent,
  viewAllHref = "/productos?destacados=1",
  children,
}: {
  storeDisplayName?: string;
  title?: string;
  titleAccent?: string;
  viewAllHref?: string;
  children: ReactNode;
}) {
  const accent =
    titleAccent ??
    (storeDisplayName ? getBrandPrefix(storeDisplayName) : undefined);

  return (
    <StorefrontReveal index={1}>
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold">
              <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">
                {title}
              </span>{" "}
              {accent ? (
                <span className="text-[var(--brand-primary)]">{accent}</span>
              ) : null}
            </h2>
            <Link
              href={viewAllHref}
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
