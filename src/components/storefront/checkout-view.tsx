"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import type { AppliedCheckoutCoupon } from "@/components/storefront/checkout-coupon-field";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { Button } from "@/components/ui/button";
import { CartPromoSummary } from "@/components/storefront/cart-promo-summary";
import { getCartPromoPricing } from "@/lib/promo-2x1";
import { useCartStore } from "@/stores/cart-store";
import { usePromoConfigStore } from "@/stores/promo-config-store";
import { formatPrice } from "@/lib/utils";
import { getClientVariantLabels } from "@/lib/variant-labels";
import type { CheckoutPaymentConfig, CheckoutPaymentMethodOption } from "@/lib/payments";
import {
  calculateTransferPaymentDiscount,
  defaultCheckoutPaymentMethod,
} from "@/lib/payments";
import { getLocaleCopy } from "@/lib/storefront-locale-copy";
import { getClientStorefrontConfig } from "@/lib/store-slug-client";
import { storefrontPath } from "@/lib/storefront-paths";

type CheckoutViewProps = {
  shippingCost: number;
  allowPickup: boolean;
  pickupOnly?: boolean;
  storeName: string;
  couponsEnabled?: boolean;
  dynamicShippingEnabled?: boolean;
  paymentConfig: CheckoutPaymentConfig;
  defaultCustomer?: {
    name: string;
    email: string;
  };
};

export function CheckoutView({
  shippingCost,
  allowPickup,
  pickupOnly = false,
  storeName,
  couponsEnabled = false,
  dynamicShippingEnabled = false,
  paymentConfig,
  defaultCustomer,
}: CheckoutViewProps) {
  const localeCopy = getLocaleCopy(getClientStorefrontConfig().locale);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCheckoutCoupon | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethodOption>(
    () => defaultCheckoutPaymentMethod(paymentConfig),
  );
  const variantLabels = getClientVariantLabels();
  const items = useCartStore((s) => s.items);
  const rawSubtotal = useCartStore((s) => s.rawSubtotal());
  const promoDiscount = useCartStore((s) => s.promoDiscount());
  const subtotal = useCartStore((s) => s.subtotal());
  const promo2x1Active = usePromoConfigStore((s) => s.promo2x1Active);
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const transferDiscount =
    paymentMethod === "transfer"
      ? calculateTransferPaymentDiscount(subtotal)
      : 0;
  const subtotalAfterCoupon = Math.max(
    0,
    subtotal - transferDiscount - couponDiscount,
  );
  const promoByVariant = getCartPromoPricing(items, promo2x1Active).byVariantId;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="storefront-card border border-dashed border-neutral-200 bg-[var(--brand-primary-soft)]/40 px-6 py-12 text-center">
          <p className="font-medium text-neutral-900">{localeCopy.emptyCart}</p>
          <p className="mt-2 text-sm text-neutral-500">{localeCopy.emptyCartHint}</p>
          <Link href={storefrontPath("catalog")} className="mt-5 inline-block">
            <Button>{localeCopy.seeProducts}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <StorefrontReveal index={0}>
        <StorefrontPageHeader
          title={localeCopy.checkoutTitle}
          description={localeCopy.checkoutDescription}
          backHref={storefrontPath("cart")}
          backLabel={localeCopy.backToCart}
        />
      </StorefrontReveal>

      <StorefrontReveal
        index={1}
        className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start"
      >
        <div className="storefront-card border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
          <CheckoutForm
            shippingCost={shippingCost}
            allowPickup={allowPickup}
            pickupOnly={pickupOnly}
            storeName={storeName}
            showSummary={false}
            defaultCustomer={defaultCustomer}
            couponsEnabled={couponsEnabled}
            dynamicShippingEnabled={dynamicShippingEnabled}
            paymentConfig={paymentConfig}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            appliedCoupon={appliedCoupon}
            onCouponChange={setAppliedCoupon}
          />
        </div>

        <aside className="storefront-card border border-neutral-200/80 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {localeCopy.yourOrder}
          </h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto border-b border-neutral-100 pb-4">
            {items.map((item) => {
              const pricing = promoByVariant.get(item.variantId) ?? {
                lineTotal: item.price * item.quantity,
              };

              return (
                <li key={item.variantId} className="flex gap-3">
                  <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-neutral-100 ring-1 ring-neutral-200/60">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="line-clamp-2 font-medium text-neutral-900">
                      {item.productName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {variantLabels.secondary}: {item.size} · {variantLabels.primary}:{" "}
                      {item.color} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium">
                    {formatPrice(pricing.lineTotal)}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="mt-4">
            <CartPromoSummary
              rawSubtotal={rawSubtotal}
              promoDiscount={promoDiscount}
              subtotal={subtotal}
              transferDiscount={transferDiscount}
              couponCode={appliedCoupon?.code}
              couponDiscount={couponDiscount}
              totalAfterDiscounts={subtotalAfterCoupon}
            />
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            {pickupOnly ? localeCopy.pickupOnlyHint : localeCopy.shippingOrPickupHint}
          </p>
        </aside>
      </StorefrontReveal>
    </div>
  );
}
