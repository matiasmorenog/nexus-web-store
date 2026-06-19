import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { HomeHeroContent } from "@/components/storefront/home-hero-content";
import {
  FeaturedProductsSection,
  FeaturedProductsSectionShell,
} from "@/components/storefront/featured-products-section";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { StorefrontSkeletonFeaturedProducts } from "@/components/storefront/storefront-skeleton";
import { Button } from "@/components/ui/button";
import { HOME_CATEGORY_TILES } from "@/lib/categories";
import { formatStoreName, getStore } from "@/lib/store-context";

export const dynamic = "force-dynamic";

const CATEGORY_IMAGES: Record<string, string> = {
  mujer: "https://images.unsplash.com/photo-1682530678019-d3482a8d8cff?w=600&q=80",
  hombre: "https://images.unsplash.com/photo-1647438174616-7bc61ca38455?w=600&q=80",
  leggings:
    "https://images.unsplash.com/photo-1762331660576-cbf66a7db84d?w=600&q=80",
  shorts:
    "https://images.unsplash.com/photo-1600404909295-aa6fb386f450?w=600&q=80",
  hoodies:
    "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&q=80",
};

export default async function HomePage() {
  const store = await getStore();
  const storeDisplayName = formatStoreName(store.name);

  const heroCategories = HOME_CATEGORY_TILES;

  return (
    <>
      <section className="relative flex h-[70vh] min-h-[400px] items-center justify-center bg-neutral-900 text-white">
        <Image
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80"
          alt={`Entrenamiento funcional ${storeDisplayName}`}
          fill
          className="object-cover opacity-50"
          priority
        />
        <HomeHeroContent>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[var(--brand-primary)]">
            Ropa para el box
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Entrená sin límites
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-neutral-200">
            Indumentaria deportiva diseñada para CrossFit y entrenamiento
            funcional. Comodidad, resistencia y estilo en cada WOD.
          </p>
          <Link href="/productos" className="mt-8 inline-block">
            <Button size="lg">Ver catálogo</Button>
          </Link>
        </HomeHeroContent>
      </section>

      <StorefrontReveal index={1}>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold">
            <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">
              Categorías
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

      <FeaturedProductsSectionShell>
        <Suspense fallback={<StorefrontSkeletonFeaturedProducts />}>
          <FeaturedProductsSection />
        </Suspense>
      </FeaturedProductsSectionShell>
    </>
  );
}
