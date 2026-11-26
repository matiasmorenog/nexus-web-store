import Image from "next/image";
import Link from "next/link";
import type { CategoriesGridContent } from "@/lib/home-content/types";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";

type App1CategoriesSectionProps = {
  content: CategoriesGridContent;
};

/**
 * StorefrontReveal is the grid item (needs aspect + stretch).
 * The Link fills that cell — do not put aspect-square on a nested <a>
 * or the tile collapses to a thin strip (inline/non-grid-item sizing).
 */
export function App1CategoriesSection({ content }: App1CategoriesSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h2 className="mb-8 text-center text-2xl font-bold">
        <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">
          {content.title}
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {content.items.map((cat, index) => (
          <StorefrontReveal
            key={cat.slug}
            index={Math.min(index, 7)}
            className="aspect-square"
          >
            <Link
              href={cat.href ?? `/productos?categoria=${cat.slug}`}
              className="group relative block h-full w-full overflow-hidden storefront-card ring-1 ring-neutral-200/60"
            >
              <Image
                src={cat.imageUrl}
                alt={cat.label}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                <span className="text-lg font-semibold text-white">{cat.label}</span>
              </div>
            </Link>
          </StorefrontReveal>
        ))}
      </div>
    </section>
  );
}
