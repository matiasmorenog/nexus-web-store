"use client";

import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CartEmptyState } from "@/components/storefront/cart-empty-state";
import { CartLineItem } from "@/components/storefront/cart-line-item";
import { CartPromoSummary } from "@/components/storefront/cart-promo-summary";
import { useCartStore } from "@/stores/cart-store";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const DRAWER_CONTENT_DELAY_MS = 260;

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, rawSubtotal, promoDiscount, subtotal, totalItems } = useCartStore();
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    let frame = 0;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      frame = requestAnimationFrame(() => setContentReady(true));
      return () => {
        cancelAnimationFrame(frame);
        setContentReady(false);
      };
    }

    const timeout = window.setTimeout(() => {
      frame = requestAnimationFrame(() => setContentReady(true));
    }, DRAWER_CONTENT_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
      setContentReady(false);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal aria-label="Carrito">
      <button
        type="button"
        aria-label="Cerrar carrito"
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px] cart-drawer-backdrop"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl cart-drawer-panel">
        <div className="shrink-0 border-b border-neutral-100">
          <div className="h-0.5 w-full bg-[var(--brand-primary)]" />
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-[var(--brand-primary)]" />
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                Carrito
                <span className="ml-1.5 font-normal text-neutral-500">
                  ({totalItems()})
                </span>
              </h2>
            </div>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            !contentReady && "opacity-0",
            contentReady && "cart-drawer-body-enter",
          )}
        >
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <CartEmptyState compact onContinue={onClose} />
            ) : (
              <ul className="space-y-3">
                {items.map((item) => (
                  <CartLineItem
                    key={item.variantId}
                    item={item}
                    variant="drawer"
                    onRemove={() => removeItem(item.variantId)}
                    onDecrease={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                    onIncrease={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                  />
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="shrink-0 border-t border-neutral-100 bg-neutral-50/60 p-5">
              <CartPromoSummary
                rawSubtotal={rawSubtotal()}
                promoDiscount={promoDiscount()}
                subtotal={subtotal()}
                compact
              />
              <p className="mb-4 mt-3 text-xs text-neutral-500">
                Envío calculado en el checkout.
              </p>
              <Link href="/checkout" onClick={onClose}>
                <Button className="w-full" size="lg">
                  Ir al checkout
                </Button>
              </Link>
              <Link href="/carrito" onClick={onClose}>
                <Button variant="outline" className="mt-2 w-full">
                  Ver carrito completo
                </Button>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
