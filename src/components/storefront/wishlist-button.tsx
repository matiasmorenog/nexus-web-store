"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { syncWishlistToggle } from "@/components/storefront/wishlist-sync";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string;
  minPrice: number;
  className?: string;
  compact?: boolean;
};

export function WishlistButton({
  productId,
  productSlug,
  productName,
  imageUrl,
  minPrice,
  className,
  compact = false,
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const [ready, setReady] = useState(false);
  const hasItem = useWishlistStore((state) => state.hasItem(productId));
  const toggleItem = useWishlistStore((state) => state.toggleItem);

  useEffect(() => {
    setReady(true);
  }, []);

  const handleToggle = () => {
    const added = toggleItem({
      productId,
      productSlug,
      productName,
      imageUrl,
      minPrice,
    });
    void syncWishlistToggle(session?.user?.role, productId, added);
  };

  if (!ready) {
    return (
      <span
        className={cn("inline-flex size-10 shrink-0 items-center justify-center", className)}
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={hasItem ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={hasItem}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] border transition-colors",
        compact ? "size-10" : "h-10 gap-2 px-3",
        hasItem
          ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]",
        className,
      )}
    >
      <Heart className={cn("size-5", hasItem && "fill-current")} />
      {!compact ? (
        <span className="text-sm font-medium">
          {hasItem ? "En favoritos" : "Favoritos"}
        </span>
      ) : null}
    </button>
  );
}
