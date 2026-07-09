import { Suspense } from "react";
import { HomeHeroCarousel } from "@/themes/app1/components/home-hero-carousel";
import { App1CategoriesSection } from "@/themes/app1/components/app1-categories-section";
import {
  FeaturedProductsSection,
  FeaturedProductsSectionShell,
} from "@/themes/app1/components/featured-products-section";
import { StorefrontSkeletonFeaturedProducts } from "@/components/storefront/storefront-skeleton";
import {
  getEnabledHomeSections,
  getStoreHomeContent,
} from "@/lib/home-content/query";
import type { HomeSection } from "@/lib/home-content/types";
import { toHomeHeroSlides } from "@/lib/home-content/map-slides";
import { getStoreId } from "@/lib/store-context";

type App1HomeProps = {
  storeDisplayName: string;
};

function renderApp1Section(section: HomeSection, storeDisplayName: string) {
  switch (section.type) {
    case "hero.carousel":
      return (
        <HomeHeroCarousel
          key={section.id}
          storeDisplayName={storeDisplayName}
          slides={toHomeHeroSlides(section.content.slides)}
          autoplayMs={section.content.autoplayMs}
        />
      );
    case "featured.products":
      return (
        <FeaturedProductsSectionShell
          key={section.id}
          title={section.content.title}
          titleAccent={section.content.titleAccent}
          viewAllHref={section.content.viewAllHref}
        >
          <Suspense fallback={<StorefrontSkeletonFeaturedProducts />}>
            <FeaturedProductsSection />
          </Suspense>
        </FeaturedProductsSectionShell>
      );
    case "categories.grid":
      return (
        <App1CategoriesSection key={section.id} content={section.content} />
      );
    default:
      return null;
  }
}

export async function App1Home({ storeDisplayName }: App1HomeProps) {
  const storeId = await getStoreId();
  const homeContent = await getStoreHomeContent(storeId, { storeDisplayName });
  const sections = getEnabledHomeSections(homeContent);

  return (
    <>
      {sections.map((section) => renderApp1Section(section, storeDisplayName))}
    </>
  );
}
