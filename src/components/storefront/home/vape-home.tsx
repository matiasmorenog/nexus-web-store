import { Suspense } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { StorefrontSkeletonFeaturedProducts } from "@/components/storefront/storefront-skeleton";
import { VapeHomeHero } from "@/components/storefront/home/vape-home-hero";
import { getStorefrontProducts } from "@/lib/storefront-products-query";
import { getVerticalConfig } from "@/lib/store-verticals";
import { getStoreId } from "@/lib/store-context";

type VapeHomeProps = {
  storeDisplayName: string;
};

async function VapeProductsGrid() {
  const storeId = await getStoreId();
  const config = getVerticalConfig();
  const products = await getStorefrontProducts(storeId, {
    featuredOnly: !config.home.showAllProducts,
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5">
      {products.map((product) => (
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

export function VapeHome({ storeDisplayName }: VapeHomeProps) {
  const config = getVerticalConfig();

  return (
    <>
      <VapeHomeHero storeDisplayName={storeDisplayName} />

      {config.features.ageNotice && (
        <StorefrontReveal index={1}>
          <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
            <p className="rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
              Venta exclusiva para mayores de 18 años. El uso de productos con
              nicotina está restringido a adultos.
            </p>
          </div>
        </StorefrontReveal>
      )}

      <StorefrontReveal index={2}>
        <section
          id="productos-vape"
          className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16"
        >
          <h2 className="mb-8 text-center text-2xl font-bold">
            <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">
              {config.home.productsSectionTitle}
            </span>
          </h2>
          <Suspense fallback={<StorefrontSkeletonFeaturedProducts />}>
            <VapeProductsGrid />
          </Suspense>
        </section>
      </StorefrontReveal>
    </>
  );
}
