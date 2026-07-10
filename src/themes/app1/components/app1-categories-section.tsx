import Image from "next/image";
import Link from "next/link";
import type { CategoriesGridContent } from "@/lib/home-content/types";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";

type App1CategoriesSectionProps = {
  content: CategoriesGridContent;
  revealIndex?: number;
};

export function App1CategoriesSection({
  content,
  revealIndex = 2,
}: App1CategoriesSectionProps) {
  return (
    <StorefrontReveal index={revealIndex}>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold">
          <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-1">
            {content.title}
          </span>
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {content.items.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.href ?? `/productos?categoria=${cat.slug}`}
              className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-neutral-200/60 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md hover:ring-[var(--brand-primary)]/30"
            >
              <Image
                src={cat.imageUrl}
                alt={cat.label}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                <span className="text-lg font-semibold text-white">{cat.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </StorefrontReveal>
  );
}
