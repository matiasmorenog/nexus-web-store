"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { ProductImage } from "@/components/storefront/product-image";
import { syncWishlistToggle } from "@/components/storefront/wishlist-sync";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn, formatPrice } from "@/lib/utils";

type WishlistPageClientProps = {
  /** Inside CustomerAccountShell — no extra bordered wrapper */
  layout?: "standalone" | "account";
};

export function WishlistPageClient({
  layout = "standalone",
}: WishlistPageClientProps) {
  const { data: session } = useSession();
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const inAccount = layout === "account";

  const handleRemove = (productId: string) => {
    removeItem(productId);
    void syncWishlistToggle(session?.user?.role, productId, false);
  };

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "text-center",
          inAccount ? "py-10" : "rounded-xl border border-neutral-200 bg-white px-6 py-12 shadow-sm",
        )}
      >
        <Heart className="mx-auto size-10 text-neutral-300" />
        <p className="mt-4 text-lg font-semibold text-neutral-900">
          Tu lista está vacía
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Guardá productos con el corazón en el catálogo o en la ficha del producto.
        </p>
        <Link
          href="/productos"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] bg-[var(--brand-primary)] px-4 text-sm font-medium text-[var(--ui-button-primary-foreground,white)] hover:brightness-95"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(inAccount ? "divide-y divide-neutral-200" : "space-y-4")}>
      {items.map((item) => (
        <article
          key={item.productId}
          className={cn(
            "flex gap-4",
            inAccount
              ? "py-4 first:pt-0 last:pb-0"
              : "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
          )}
        >
          <Link
            href={`/producto/${item.productSlug}`}
            className="relative block size-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
          >
            <ProductImage
              src={item.imageUrl}
              alt={item.productName}
              className="object-cover"
            />
          </Link>

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <Link
                href={`/producto/${item.productSlug}`}
                className="font-semibold text-neutral-900 hover:text-[var(--brand-primary)]"
              >
                {item.productName}
              </Link>
              <p className="mt-1 text-lg font-bold text-neutral-900">
                {formatPrice(item.minPrice)}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <Link
                href={`/producto/${item.productSlug}`}
                className="inline-flex h-8 items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] border border-[var(--brand-primary)] bg-transparent px-3 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)]"
              >
                Ver producto
              </Link>
              <Button
                type="button"
                variant="outline"
                aria-label={`Quitar ${item.productName} de favoritos`}
                onClick={() => handleRemove(item.productId)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
