import { Suspense } from "react";
import { HomeHeroCarousel } from "@/themes/apparel/components/home-hero-carousel";
import { ApparelCategoriesSection } from "@/themes/apparel/components/apparel-categories-section";
import {
  FeaturedProductsSection,
  FeaturedProductsSectionShell,
} from "@/themes/apparel/components/featured-products-section";
import { StorefrontSkeletonFeaturedProducts } from "@/components/storefront/storefront-skeleton";
import {
  getEnabledHomeSections,
  getStoreHomeContent,
} from "@/lib/home-content/query";
import type { HomeSection } from "@/lib/home-content/types";
import { toHomeHeroSlides } from "@/lib/home-content/map-slides";
import { getStoreId } from "@/lib/store-context";

type ApparelHomeProps = {
  storeDisplayName: string;
};

function renderApparelSection(section: HomeSection, storeDisplayName: string) {
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
        <ApparelCategoriesSection key={section.id} content={section.content} />
      );
    default:
      return null;
  }
}

export async function ApparelHome({ storeDisplayName }: ApparelHomeProps) {
  const storeId = await getStoreId();
  const homeContent = await getStoreHomeContent(storeId, { storeDisplayName });
  const sections = getEnabledHomeSections(homeContent);

  return (
    <>
      {sections.map((section) => renderApparelSection(section, storeDisplayName))}
    </>
  );
}
