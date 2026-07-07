import Image from "next/image";
import Link from "next/link";
import { vapeButtonClassName } from "@/themes/vape/components/vape-button";
import { Star } from "lucide-react";
import type { StorefrontProductCard } from "@/lib/storefront-products-query";
import { formatPrice, cn } from "@/lib/utils";

export type VapeProductCardData = StorefrontProductCard & {
  categoryLabel: string;
};

type VapeProductCardProps = VapeProductCardData & {
  badge?: string | null;
  badgeClassName?: string;
};

function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-3 w-3",
            s <= 5 ? "fill-yellow-400 text-yellow-400" : "text-[var(--brand-primary-mid)]",
          )}
        />
      ))}
    </div>
  );
}

function resolveBadge(product: VapeProductCardData): {
  label: string | null;
  className: string;
} {
  if (product.promo2x1) {
    return { label: "2x1", className: "bg-[var(--brand-promo-accent)] text-[var(--brand-primary-darker)]" };
  }
  if (product.featured) {
    return { label: "Destacado", className: "bg-[var(--brand-primary)] text-[var(--brand-primary-darker)]" };
  }
  return { label: null, className: "" };
}

export function VapeProductCard(props: VapeProductCardProps) {
  const {
    slug,
    name,
    imageUrl,
    hoverImageUrl,
    price,
    inStock,
    badge: badgeOverride,
    categoryLabel,
    badgeClassName,
  } = props;

  const resolved = resolveBadge(props);
  const badge = badgeOverride !== undefined ? badgeOverride : resolved.label;
  const badgeClass = badgeClassName ?? resolved.className;
  const hasHoverImage = Boolean(inStock && hoverImageUrl && hoverImageUrl !== imageUrl);

  return (
    <article className="group overflow-hidden rounded-lg border border-vape bg-vape-card transition-all duration-300 hover:border-[color-mix(in_srgb,var(--brand-primary)_30%,transparent)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--brand-primary-mid)]">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={name}
              fill
              className={cn(
                "object-cover opacity-80 transition-all duration-500 group-hover:opacity-100",
                !hasHoverImage && inStock && "group-hover:scale-105",
                hasHoverImage && "group-hover:opacity-0",
              )}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            {hasHoverImage && hoverImageUrl ? (
              <Image
                src={hoverImageUrl}
                alt=""
                fill
                aria-hidden
                className="object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : null}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-vape-muted">Sin imagen</div>
        )}

        {badge ? (
          <span
            className={cn(
              "absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold",
              badgeClass,
            )}
          >
            {badge}
          </span>
        ) : null}

        {!inStock ? (
          <span className="absolute right-3 top-3 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
            Sin stock
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <Link
            href={`/producto/${slug}`}
            className={vapeButtonClassName({
              variant: "primary",
              size: "sm",
              className:
                "w-full rounded-none py-3 text-xs font-bold tracking-wider hover:brightness-110",
            })}
          >
            VER PRODUCTO
          </Link>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-vape-muted">
          {categoryLabel}
        </p>
        <h3 className="mb-2 truncate text-sm font-semibold leading-tight text-[var(--brand-primary-light,#f0f0f5)]">
          {name}
        </h3>
        <div className="mb-3 flex items-center gap-1.5">
          <StarRating />
        </div>
        <p className="text-base font-bold text-[var(--brand-primary)]">
          {price > 0 ? formatPrice(price) : "—"}
        </p>
      </div>
    </article>
  );
}
