"use client";

import Link from "next/link";
import { storefrontPath } from "@/lib/storefront-paths";
import { useHydrated } from "@/lib/use-hydrated";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils";
import { app2ButtonClassName } from "@/themes/app2/components/app2-button";
import { getStorefrontCopy } from "@/lib/storefront-copy";

type WishlistHeaderLinkProps = {
  chrome?: "light" | "dark";
  uiVariant?: "app1" | "app2" | "app3";
};

export function WishlistHeaderLink({
  chrome = "light",
  uiVariant = "app1",
}: WishlistHeaderLinkProps) {
  const ready = useHydrated();
  const totalItems = useWishlistStore((state) => state.totalItems());
  const copy = getStorefrontCopy();

  const app2Class = app2ButtonClassName({
    variant: "ghost",
    size: "md",
    className: "relative h-10 px-3",
  });

  const lightClass =
    "relative inline-flex h-10 cursor-pointer items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] border border-neutral-300 bg-white px-3 text-neutral-900 transition-colors hover:border-neutral-400 hover:bg-neutral-50";

  const darkClass =
    "relative inline-flex h-10 cursor-pointer items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] border border-white/15 bg-white/5 px-3 text-neutral-100 transition-colors hover:border-white/25 hover:bg-white/10";

  return (
    <Link
      href={storefrontPath("wishlist")}
      aria-label={copy.favorites}
      className={cn(
        uiVariant === "app2"
          ? app2Class
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
