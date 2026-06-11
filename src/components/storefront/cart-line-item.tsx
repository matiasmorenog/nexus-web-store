import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { CartQuantityStepper } from "@/components/storefront/cart-quantity-stepper";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

type CartLineItemProps = {
  item: CartItem;
  onRemove: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
  variant?: "drawer" | "page";
};

export function CartLineItem({
  item,
  onRemove,
  onDecrease,
  onIncrease,
  variant = "drawer",
}: CartLineItemProps) {
  const isPage = variant === "page";

  return (
    <li
      className={cn(
        isPage
          ? "rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm"
          : "rounded-lg border border-neutral-100 bg-neutral-50/40 p-3",
      )}
    >
      <div className="flex gap-3 sm:gap-4">
        <Link
          href={`/producto/${item.productSlug}`}
          className={cn(
            "relative shrink-0 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-200/60",
            isPage ? "h-28 w-20 sm:h-32 sm:w-24" : "h-24 w-20",
          )}
        >
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes={isPage ? "96px" : "80px"}
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/producto/${item.productSlug}`}
                className="line-clamp-2 text-sm font-medium text-neutral-900 transition-colors hover:text-[var(--brand-primary)] sm:text-base"
              >
                {item.productName}
              </Link>
              <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                {item.size} · {item.color}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                {formatPrice(item.price)} c/u
              </p>
            </div>
            <button
              type="button"
              aria-label={`Quitar ${item.productName} del carrito`}
              onClick={onRemove}
              className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <CartQuantityStepper
              quantity={item.quantity}
              max={item.stock}
              onDecrease={onDecrease}
              onIncrease={onIncrease}
              compact={!isPage}
            />
            <p className="text-sm font-semibold text-neutral-900 sm:text-base">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}
