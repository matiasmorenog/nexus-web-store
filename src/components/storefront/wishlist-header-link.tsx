"use client";

import Link from "next/link";
import { useHydrated } from "@/lib/use-hydrated";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils";
import { vapeButtonClassName } from "@/themes/vape/components/vape-button";

type WishlistHeaderLinkProps = {
  chrome?: "light" | "dark";
  uiVariant?: "apparel" | "vape";
};

export function WishlistHeaderLink({
  chrome = "light",
  uiVariant = "apparel",
}: WishlistHeaderLinkProps) {
  const ready = useHydrated();
  const totalItems = useWishlistStore((state) => state.totalItems());

  const vapeClass = vapeButtonClassName({
    variant: "ghost",
    size: "md",
    className: "relative h-10 w-10 px-0",
  });

  const lightClass =
    "relative inline-flex h-10 cursor-pointer items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] border border-neutral-300 bg-white px-2.5 text-neutral-900 transition-colors hover:border-neutral-400 hover:bg-neutral-50 sm:px-3";

  const darkClass =
    "relative inline-flex h-10 cursor-pointer items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] border border-white/15 bg-white/5 px-2.5 text-neutral-100 transition-colors hover:border-white/25 hover:bg-white/10 sm:px-3";

  return (
    <Link
      href="/favoritos"
      aria-label="Ver favoritos"
      className={cn(
        uiVariant === "vape"
          ? vapeClass
          : chrome === "dark"
            ? darkClass
            : lightClass,
      )}
    >
      <Heart className="h-5 w-5" />
      {ready && totalItems > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] px-1 text-[10px] font-bold text-[var(--ui-button-primary-foreground,white)]">
          {totalItems}
        </span>
      ) : null}
    </Link>
  );
}
