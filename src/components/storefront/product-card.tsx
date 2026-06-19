import Image from "next/image";
import Link from "next/link";
import { getProductTaxonomyLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  slug: string;
  name: string;
  category: string;
  audience: string;
  imageUrl: string;
  hoverImageUrl?: string;
  price: number;
  className?: string;
};

export function ProductCard({
  slug,
  name,
  category,
  audience,
  imageUrl,
  hoverImageUrl,
  price,
  className,
}: ProductCardProps) {
  const hasHoverImage = Boolean(
    hoverImageUrl && hoverImageUrl !== imageUrl,
  );

  return (
    <Link
      href={`/producto/${slug}`}
      className={cn("group block h-full", className)}
    >
      <article
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200/90 bg-white p-3 shadow-sm ring-1 ring-neutral-900/[0.04]",
          "transition-[box-shadow,transform] duration-200",
          "group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-[var(--brand-primary)]/15",
        )}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100 shadow-sm ring-1 ring-neutral-200/50 transition-[ring-color] group-hover:ring-[var(--brand-primary)]/30">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className={cn(
              "object-cover",
              hasHoverImage
                ? "motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-0"
                : "motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105",
            )}
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
          {hasHoverImage && hoverImageUrl && (
            <Image
              src={hoverImageUrl}
              alt=""
              fill
              aria-hidden
              className="object-cover opacity-0 motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-100"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          )}
        </div>
        <div className="mt-3 flex flex-1 flex-col gap-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            {getProductTaxonomyLabel(category, audience)}
          </p>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-neutral-900 transition-colors group-hover:text-[var(--brand-primary)]">
            {name}
          </h3>
          <p className="mt-auto pt-1.5 text-sm font-semibold text-neutral-900">
            {formatPrice(price)}
          </p>
        </div>
      </article>
    </Link>
  );
}
