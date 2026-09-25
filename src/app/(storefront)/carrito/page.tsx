"use client";

import { CartEmptyState } from "@/components/storefront/cart-empty-state";
import { CartLineItem } from "@/components/storefront/cart-line-item";
import { CartPromoSummary } from "@/components/storefront/cart-promo-summary";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { getStorefrontCopy } from "@/lib/storefront-copy";
import { getClientStorefrontConfig } from "@/lib/store-slug-client";

export default function CartPage() {
  const { items, removeItem, updateQuantity, rawSubtotal, promoDiscount, subtotal, totalItems } =
    useCartStore();
  const copy = getStorefrontCopy();
  const checkoutEnabled = getClientStorefrontConfig().features.checkout;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <StorefrontReveal index={0}>
        <StorefrontPageHeader
          title={copy.cart}
          description={
            items.length > 0
              ? copy.cartItems(totalItems())
              : copy.cartReview
          }
          backHref="/productos"
          backLabel={copy.keepShopping}
        />
      </StorefrontReveal>

      {items.length === 0 ? (
        <StorefrontReveal index={1}>
          <CartEmptyState />
        </StorefrontReveal>
      ) : (
        <StorefrontReveal
          index={1}
          className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start"
        >
          <ul className="space-y-4">
            {items.map((item, index) => (
              <StorefrontReveal key={item.variantId} index={Math.min(index, 4)}>
                <CartLineItem
                  item={item}
                  variant="page"
                  onRemove={() => removeItem(item.variantId)}
                  onDecrease={() =>
                    updateQuantity(item.variantId, item.quantity - 1)
                  }
                  onIncrease={() =>
                    updateQuantity(item.variantId, item.quantity + 1)
                  }
                />
              </StorefrontReveal>
            ))}
          </ul>

          <aside className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {copy.cartSummary}
            </h2>
            <div className="mt-4 space-y-2 border-b border-neutral-100 pb-4 text-sm">
              <CartPromoSummary
                rawSubtotal={rawSubtotal()}
                promoDiscount={promoDiscount()}
                subtotal={subtotal()}
              />
              <div className="flex justify-between text-neutral-600">
                <span>{copy.shipping}</span>
                <span className="text-neutral-400">{copy.atCheckout}</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-medium text-neutral-900">{copy.estimatedTotal}</span>
              <span className="text-xl font-bold text-neutral-900">
                {formatPrice(subtotal())}
              </span>
            </div>
            <Link href={checkoutEnabled ? "/checkout" : "/contacto"} className="mt-5 block">
              <Button size="lg" className="w-full">
                {checkoutEnabled ? copy.checkoutAction : copy.requestAction}
              </Button>
            </Link>
            <p className="mt-3 text-center text-xs text-neutral-400">
              {checkoutEnabled ? copy.checkoutHint : copy.requestHint}
            </p>
          </aside>
        </StorefrontReveal>
      )}
    </div>
  );
}
