/** Client-safe exports (defaults + types). Server: use query.ts / admin-persist.ts */
export {
  buildDefaultApp1HomeContent,
  buildDefaultHomeContent,
  buildDefaultApp2HomeContent,
  getHomeSection,
  sortHomeSections,
} from "@/lib/home-content/defaults";
export {
  HOME_CONTENT_VERSION,
  HOME_SECTION_TYPES,
  homeContentPayloadSchema,
  homeSectionSchema,
  type CategoriesGridContent,
  type FeaturedProductsContent,
  type FeaturesBarContent,
  type HeroCarouselContent,
  type HeroCarouselSlide,
  type HeroStaticContent,
  type HomeContentPayload,
  type HomeSection,
  type HomeSectionByType,
  type HomeSectionType,
  type NewsletterContent,
  type PromoBannerContent,
} from "@/lib/home-content/types";
