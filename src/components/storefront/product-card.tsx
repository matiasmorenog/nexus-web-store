import Image from "next/image";
import Link from "next/link";
import { getProductTaxonomyLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Promo2x1Badge } from "@/components/storefront/promo-2x1-badge";
import { getClientStorefrontConfig } from "@/lib/store-slug-client";
import { getStorefrontCopy } from "@/lib/storefront-copy";
import { productHref } from "@/lib/storefront-paths";

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
  /** Distinct colors; shown only when >= 2. */
  colorCount?: number;
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
  colorCount = 0,
  className,
}: ProductCardProps) {
  const showPromoBadge = promo2x1;
  const copy = getStorefrontCopy();
  const atelierCard = getClientStorefrontConfig().ui.id === "app3";
  const hasHoverImage = Boolean(
    inStock && hoverImageUrl && hoverImageUrl !== imageUrl,
  );
  const showColorCount = colorCount >= 2;

  return (
    <Link
      href={productHref(slug)}
      className={cn("group block h-full", className)}
    >
      <article
        className={cn(
          "storefront-card flex h-full flex-col overflow-hidden border bg-white shadow-sm transition duration-300 ease-out",
          "hover:-translate-y-1 hover:bg-white/70 hover:shadow-xl hover:backdrop-blur-md",
          atelierCard
            ? "border-[#202523]/12 hover:border-[#202523]/22"
            : "border-neutral-200 hover:border-neutral-300/70",
          !inStock && "opacity-95",
        )}
      >
        {/* Image stays opaque — glass is chrome (card lift / border / footer see-through). */}
        <div className="relative isolate z-[1] aspect-[3/4] overflow-hidden bg-neutral-100">
          {showPromoBadge && (
            <span className="absolute right-3 top-3 z-20">
              <Promo2x1Badge onImage />
            </span>
          )}
          {!inStock && (
            <span className="absolute left-3 top-3 z-20 rounded-md bg-neutral-900/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
              {copy.outOfStock}
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
              {copy.noImage}
            </div>
          )}
        </div>
        <div className="relative z-[1] flex flex-1 flex-col gap-1 p-3">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[color-mix(in_srgb,var(--brand-primary)_8%,transparent)]" />
          </div>
          <p className="relative text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            {getProductTaxonomyLabel(category, audience)}
          </p>
          <h3
            className={cn(
              "relative line-clamp-2 text-sm font-medium leading-snug transition-colors",
              inStock
                ? "text-neutral-900 group-hover:text-[var(--brand-primary)]"
                : "text-neutral-600",
            )}
          >
            {name}
          </h3>
          {showColorCount ? (
            <p className="relative text-xs text-neutral-500">
              {copy.colorCount(colorCount)}
            </p>
          ) : null}
          <p
            className={cn(
              "relative mt-auto pt-1.5 text-sm font-semibold",
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
