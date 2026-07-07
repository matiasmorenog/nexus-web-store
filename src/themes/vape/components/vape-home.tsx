import { Suspense } from "react";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { StorefrontSkeletonFeaturedProducts } from "@/components/storefront/storefront-skeleton";
import { VapeAgeNotice } from "@/themes/vape/components/home/vape-age-notice";
import { VapeCategoriesSection } from "@/themes/vape/components/home/vape-categories-section";
import { VapeFeaturesBar } from "@/themes/vape/components/home/vape-features-bar";
import { VapeNewsletter } from "@/themes/vape/components/home/vape-newsletter";
import { VapeProductsSection } from "@/themes/vape/components/home/vape-products-section";
import { VapePromoBanner } from "@/themes/vape/components/home/vape-promo-banner";
import { VapeHomeHero } from "@/themes/vape/components/vape-home-hero";
import { VapeJunglePageAtmosphere } from "@/themes/vape/components/vape-nature-decor";
import { getStorefrontProducts } from "@/lib/storefront-products-query";
import { getProductTaxonomyLabel } from "@/lib/categories";
import { getStorefrontConfig } from "@/lib/store-verticals";
import { getStoreId } from "@/lib/store-context";

type VapeHomeProps = {
  storeDisplayName: string;
};

async function VapeProducts() {
  const storeId = await getStoreId();
  const config = getStorefrontConfig();
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
  const config = getStorefrontConfig();

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
