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
import {
  getEnabledHomeSections,
  getStoreHomeContent,
} from "@/lib/home-content/query";
import type { HomeSection } from "@/lib/home-content/types";
import { getStorefrontProducts } from "@/lib/storefront-products-query";
import { getProductTaxonomyLabel } from "@/lib/categories";
import { getStorefrontConfig } from "@/lib/store-verticals";
import { getStoreId } from "@/lib/store-context";

type VapeHomeProps = {
  storeDisplayName: string;
};

async function VapeProducts({ title }: { title: string }) {
  const storeId = await getStoreId();
  const config = getStorefrontConfig();
  const products = await getStorefrontProducts(storeId, {
    featuredOnly: !config.home.showAllProducts,
  });

  const productsWithLabels = products.map((product) => ({
    ...product,
    categoryLabel: getProductTaxonomyLabel(product.category, product.audience),
  }));

  return <VapeProductsSection products={productsWithLabels} title={title} />;
}

function renderVapeSection(
  section: HomeSection,
  storeDisplayName: string,
  revealIndex: number,
  showAgeNotice: boolean,
) {
  switch (section.type) {
    case "hero.static":
      return (
        <VapeHomeHero
          key={section.id}
          storeDisplayName={storeDisplayName}
          content={section.content}
        />
      );
    case "features.bar":
      return <VapeFeaturesBar key={section.id} content={section.content} />;
    case "categories.grid":
      return (
        <div key={section.id}>
          {showAgeNotice ? (
            <StorefrontReveal index={revealIndex}>
              <VapeAgeNotice />
            </StorefrontReveal>
          ) : null}
          <StorefrontReveal index={revealIndex + (showAgeNotice ? 1 : 0)}>
            <VapeCategoriesSection content={section.content} />
          </StorefrontReveal>
        </div>
      );
    case "featured.products":
      return (
        <StorefrontReveal key={section.id} index={revealIndex}>
          <Suspense fallback={<StorefrontSkeletonFeaturedProducts />}>
            <VapeProducts title={section.content.title} />
          </Suspense>
        </StorefrontReveal>
      );
    case "promo.banner":
      return (
        <StorefrontReveal key={section.id} index={revealIndex}>
          <VapePromoBanner content={section.content} />
        </StorefrontReveal>
      );
    case "newsletter":
      return <VapeNewsletter key={section.id} content={section.content} />;
    default:
      return null;
  }
}

export async function VapeHome({ storeDisplayName }: VapeHomeProps) {
  const storeId = await getStoreId();
  const config = getStorefrontConfig();
  const homeContent = await getStoreHomeContent(storeId, { storeDisplayName });
  const sections = getEnabledHomeSections(homeContent);

  return (
    <>
      <VapeJunglePageAtmosphere />
      {sections.map((section, index) => {
        const usesReveal =
          section.type !== "hero.static" &&
          section.type !== "features.bar" &&
          section.type !== "newsletter";
        const revealIndex = usesReveal ? index : 0;

        return renderVapeSection(
          section,
          storeDisplayName,
          revealIndex,
          config.features.ageNotice && section.type === "categories.grid",
        );
      })}
    </>
  );
}
