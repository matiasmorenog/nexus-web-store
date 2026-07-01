import { Suspense } from "react";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { StorefrontSkeletonFeaturedProducts } from "@/components/storefront/storefront-skeleton";
import { VapeAgeNotice } from "@/components/storefront/home/vape/vape-age-notice";
import { VapeCategoriesSection } from "@/components/storefront/home/vape/vape-categories-section";
import { VapeFeaturesBar } from "@/components/storefront/home/vape/vape-features-bar";
import { VapeNewsletter } from "@/components/storefront/home/vape/vape-newsletter";
import { VapeProductsSection } from "@/components/storefront/home/vape/vape-products-section";
import { VapePromoBanner } from "@/components/storefront/home/vape/vape-promo-banner";
import { VapeHomeHero } from "@/components/storefront/home/vape-home-hero";
import { VapeJunglePageAtmosphere } from "@/components/storefront/home/vape-nature-decor";
import { getStorefrontProducts } from "@/lib/storefront-products-query";
import { getProductTaxonomyLabel } from "@/lib/categories";
import { getVerticalConfig } from "@/lib/store-verticals";
import { getStoreId } from "@/lib/store-context";

type VapeHomeProps = {
  storeDisplayName: string;
};

async function VapeProducts() {
  const storeId = await getStoreId();
  const config = getVerticalConfig();
  const products = await getStorefrontProducts(storeId, {
    featuredOnly: !config.home.showAllProducts,
  });

  const productsWithLabels = products.map((product) => ({
    ...product,
    categoryLabel: getProductTaxonomyLabel(product.category, product.audience),
  }));

  return (
    <VapeProductsSection
      products={productsWithLabels}
      title={config.home.productsSectionTitle}
    />
  );
}

export function VapeHome({ storeDisplayName }: VapeHomeProps) {
  const config = getVerticalConfig();

  return (
    <>
      <VapeJunglePageAtmosphere />
      <VapeHomeHero storeDisplayName={storeDisplayName} />
      <VapeFeaturesBar />

      {config.features.ageNotice && (
        <StorefrontReveal index={1}>
          <VapeAgeNotice />
        </StorefrontReveal>
      )}

      <StorefrontReveal index={2}>
        <VapeCategoriesSection />
      </StorefrontReveal>

      <StorefrontReveal index={3}>
        <Suspense fallback={<StorefrontSkeletonFeaturedProducts />}>
          <VapeProducts />
        </Suspense>
      </StorefrontReveal>

      <StorefrontReveal index={4}>
        <VapePromoBanner />
      </StorefrontReveal>

      <VapeNewsletter />
    </>
  );
}
