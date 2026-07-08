import Image from "next/image";
import Link from "next/link";
import { getProductTaxonomyLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Promo2x1Badge } from "@/components/storefront/promo-2x1-badge";

type ProductCardProps = {
  slug: string;
  name: string;
  category: string;
  audience: string;
  imageUrl: string;
  hoverImageUrl?: string;
  price: number;
  inStock?: boolean;
  promo2x1?: boolean;
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
  inStock = true,
  promo2x1 = false,
  className,
}: ProductCardProps) {
  const showPromoBadge = promo2x1;
  const hasHoverImage = Boolean(
    inStock && hoverImageUrl && hoverImageUrl !== imageUrl,
  );

  return (
    <Link
      href={`/producto/${slug}`}
      className={cn("group block h-full", className)}
    >
      <article
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-sm ring-1 ring-neutral-900/[0.04]",
          "transition-[box-shadow,transform] duration-200",
          inStock &&
            "group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-[var(--brand-primary)]/15",
          !inStock && "opacity-95",
        )}
      >
        <div className="relative isolate aspect-[3/4] overflow-hidden bg-neutral-100">
          {showPromoBadge && (
            <span className="absolute right-3 top-3 z-20">
              <Promo2x1Badge onImage />
            </span>
          )}
          {!inStock && (
            <span className="absolute left-3 top-3 z-20 rounded-md bg-neutral-900/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
              Sin stock
            </span>
          )}
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={name}
                fill
                className={cn(
                  "object-cover",
                  !inStock && "opacity-80 saturate-[0.85]",
                  hasHoverImage
                    ? "motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-0"
                    : inStock &&
                        "motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105",
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
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-xs text-neutral-400">
              Sin imagen
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            {getProductTaxonomyLabel(category, audience)}
          </p>
          <h3
            className={cn(
              "line-clamp-2 text-sm font-medium leading-snug transition-colors",
              inStock
                ? "text-neutral-900 group-hover:text-[var(--brand-primary)]"
                : "text-neutral-600",
            )}
          >
            {name}
          </h3>
          <p
            className={cn(
              "mt-auto pt-1.5 text-sm font-semibold",
              inStock ? "text-neutral-900" : "text-neutral-500",
            )}
          >
            {price > 0 ? formatPrice(price) : "—"}
          </p>
        </div>
      </article>
    </Link>
  );
}
