import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { STORE_CATEGORIES } from "@/lib/categories";
import { db } from "@/lib/db";
import { formatStoreName, getStore, getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

const CATEGORY_IMAGES: Record<string, string> = {
  tops: "https://images.unsplash.com/photo-1611858447638-1113f15f7177?w=600&q=80",
  leggings:
    "https://images.unsplash.com/photo-1762331660576-cbf66a7db84d?w=600&q=80",
  shorts:
    "https://images.unsplash.com/photo-1600404909295-aa6fb386f450?w=600&q=80",
  hoodies:
    "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&q=80",
};

export default async function HomePage() {
  const storeId = await getStoreId();
  const store = await getStore();
  const storeDisplayName = formatStoreName(store.name);

  const featuredProducts = await db.product.findMany({
    where: { storeId, featured: true },
    include: {
      variants: { take: 1, orderBy: { price: "asc" } },
    },
    take: 8,
  });

  const heroCategories = STORE_CATEGORIES.filter(
    (c) => c.slug !== "accesorios",
  );

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
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold">
          <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">Categorías</span>
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {heroCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/productos?categoria=${cat.slug}`}
              className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-neutral-200/60 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md hover:ring-[var(--brand-primary)]/30"
            >
              <Image
                src={CATEGORY_IMAGES[cat.slug] ?? CATEGORY_IMAGES.tops}
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

      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold">
              <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">Destacados del box</span>
            </h2>
            <Link
              href="/productos"
              className="text-sm font-medium text-[var(--brand-primary)] hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                category={product.category}
                imageUrl={product.variants[0]?.imageUrl ?? ""}
                price={Number(product.variants[0]?.price ?? 0)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
