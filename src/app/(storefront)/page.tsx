import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { HomeHeroCarousel } from "@/components/storefront/home-hero-carousel";
import {
  FeaturedProductsSection,
  FeaturedProductsSectionShell,
} from "@/components/storefront/featured-products-section";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { StorefrontSkeletonFeaturedProducts } from "@/components/storefront/storefront-skeleton";
import { HOME_CATEGORY_TILES } from "@/lib/categories";
import { formatStoreName, getStore } from "@/lib/store-context";

export const dynamic = "force-dynamic";

const CATEGORY_IMAGES: Record<string, string> = {
  mujer: "https://images.unsplash.com/photo-1682530678019-d3482a8d8cff?w=600&q=80",
  hombre: "https://images.unsplash.com/photo-1647438174616-7bc61ca38455?w=600&q=80",
  remeras:
    "https://images.unsplash.com/photo-1611858447638-1113f15f7177?w=600&q=80",
  musculosas:
    "https://images.unsplash.com/photo-1682530678019-d3482a8d8cff?w=600&q=80",
  tops: "https://images.unsplash.com/photo-1531520563951-4c0e3d3fcacc?w=600&q=80",
  leggings:
    "https://images.unsplash.com/photo-1762331660576-cbf66a7db84d?w=600&q=80",
  shorts:
    "https://images.unsplash.com/photo-1600404909295-aa6fb386f450?w=600&q=80",
  hoodies:
    "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&q=80",
  accesorios:
    "https://images.unsplash.com/photo-1532382708467-d720b918f0da?w=600&q=80",
};

export default async function HomePage() {
  const store = await getStore();
  const storeDisplayName = formatStoreName(store.name);

  const heroCategories = HOME_CATEGORY_TILES;

  return (
    <>
      <HomeHeroCarousel storeDisplayName={storeDisplayName} />

      <FeaturedProductsSectionShell storeDisplayName={storeDisplayName}>
        <Suspense fallback={<StorefrontSkeletonFeaturedProducts />}>
          <FeaturedProductsSection />
        </Suspense>
      </FeaturedProductsSectionShell>

      <StorefrontReveal index={2}>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold">
            <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">
              Categorías
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {heroCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.href}
                className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-neutral-200/60 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md hover:ring-[var(--brand-primary)]/30"
              >
                <Image
                  src={CATEGORY_IMAGES[cat.slug] ?? CATEGORY_IMAGES.mujer}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="text-lg font-semibold text-white">
                    {cat.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </StorefrontReveal>
    </>
  );
}
