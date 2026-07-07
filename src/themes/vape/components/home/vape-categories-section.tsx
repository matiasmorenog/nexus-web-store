import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { CategoriesGridContent } from "@/lib/home-content/types";
import { VapeSectionHeading } from "@/themes/vape/components/home/vape-section-heading";
import { vapeCatalogHref } from "@/lib/store-verticals/vape/config";

type VapeCategoriesSectionProps = {
  content: CategoriesGridContent;
};

export function VapeCategoriesSection({ content }: VapeCategoriesSectionProps) {
  return (
    <section id="categorias" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-20 sm:px-6">
      <div className="mb-10 flex items-end justify-between">
        <VapeSectionHeading eyebrow={content.eyebrow} title={content.title} />
        <Link
          href={content.viewAllHref}
          className="hidden items-center gap-1 text-sm text-vape-muted transition-colors hover:text-[var(--brand-primary)] sm:flex"
        >
          Ver todo <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {content.items.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href ?? vapeCatalogHref(cat.slug)}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-vape bg-vape-card transition-all duration-300 hover:border-[color-mix(in_srgb,var(--brand-primary)_40%,transparent)]"
          >
            <Image
              src={cat.imageUrl}
              alt={cat.label}
              fill
              className="object-cover opacity-60 transition-all duration-500 group-hover:scale-105 group-hover:opacity-80"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t ${cat.gradientClass} from-[var(--brand-primary-darker)]/90 via-[var(--brand-primary-darker)]/40 to-transparent`}
            />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="font-vape-display text-lg font-bold text-[var(--brand-primary-light,#f0f0f5)]">
                {cat.label}
              </h3>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[var(--brand-primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Explorar <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
