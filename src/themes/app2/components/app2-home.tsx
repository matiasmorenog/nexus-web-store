import { Suspense } from "react";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { StorefrontSkeletonFeaturedProducts } from "@/components/storefront/storefront-skeleton";
import { App2AgeNotice } from "@/themes/app2/components/home/app2-age-notice";
import { App2CategoriesSection } from "@/themes/app2/components/home/app2-categories-section";
import { App2FeaturesBar } from "@/themes/app2/components/home/app2-features-bar";
import { App2Newsletter } from "@/themes/app2/components/home/app2-newsletter";
import { App2ProductsSection } from "@/themes/app2/components/home/app2-products-section";
import { App2PromoBanner } from "@/themes/app2/components/home/app2-promo-banner";
import { App2HomeHero } from "@/themes/app2/components/app2-home-hero";
import { App2JunglePageAtmosphere } from "@/themes/app2/components/app2-nature-decor";
import {
  getEnabledHomeSections,
  getStoreHomeContent,
} from "@/lib/home-content/query";
import type { HomeSection } from "@/lib/home-content/types";
import { getStorefrontProducts } from "@/lib/storefront-products-query";
import { getProductTaxonomyLabel } from "@/lib/categories";
import { getStorefrontConfig } from "@/lib/store-verticals";
import { getStoreId } from "@/lib/store-context";

type App2HomeProps = {
  storeDisplayName: string;
};

async function App2Products({ title }: { title: string }) {
  const storeId = await getStoreId();
  const config = getStorefrontConfig();
  const products = await getStorefrontProducts(storeId, {
    featuredOnly: !config.home.showAllProducts,
  });

  const productsWithLabels = products.map((product) => ({
    ...product,
    categoryLabel: getProductTaxonomyLabel(product.category, product.audience),
  }));

  return <App2ProductsSection products={productsWithLabels} title={title} />;
}

function renderApp2Section(
  section: HomeSection,
  storeDisplayName: string,
  revealIndex: number,
  showAgeNotice: boolean,
) {
  switch (section.type) {
    case "hero.static":
      return (
        <App2HomeHero
          key={section.id}
          storeDisplayName={storeDisplayName}
          content={section.content}
        />
      );
    case "features.bar":
      return <App2FeaturesBar key={section.id} content={section.content} />;
    case "categories.grid":
      return (
        <div key={section.id}>
          {showAgeNotice ? (
            <StorefrontReveal index={revealIndex}>
              <App2AgeNotice />
            </StorefrontReveal>
          ) : null}
          <StorefrontReveal index={revealIndex + (showAgeNotice ? 1 : 0)}>
            <App2CategoriesSection content={section.content} />
          </StorefrontReveal>
        </div>
      );
    case "featured.products":
      return (
        <StorefrontReveal key={section.id} index={revealIndex}>
          <Suspense fallback={<StorefrontSkeletonFeaturedProducts />}>
            <App2Products title={section.content.title} />
          </Suspense>
        </StorefrontReveal>
      );
    case "promo.banner":
      return (
        <StorefrontReveal key={section.id} index={revealIndex}>
          <App2PromoBanner content={section.content} />
        </StorefrontReveal>
      );
    case "newsletter":
      return <App2Newsletter key={section.id} content={section.content} />;
    default:
      return null;
  }
}

export async function App2Home({ storeDisplayName }: App2HomeProps) {
  const storeId = await getStoreId();
  const config = getStorefrontConfig();
  const homeContent = await getStoreHomeContent(storeId, { storeDisplayName });
  const sections = getEnabledHomeSections(homeContent);

  return (
    <>
      <App2JunglePageAtmosphere />
      {sections.map((section, index) => {
        const usesReveal =
          section.type !== "hero.static" &&
          section.type !== "features.bar" &&
          section.type !== "newsletter";
        const revealIndex = usesReveal ? index : 0;

        return renderApp2Section(
          section,
          storeDisplayName,
          revealIndex,
          config.features.ageNotice && section.type === "categories.grid",
        );
      })}
    </>
  );
}
