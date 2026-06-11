"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

type CheckoutViewProps = {
  shippingCost: number;
  allowPickup: boolean;
  storeName: string;
};

export function CheckoutView({
  shippingCost,
  allowPickup,
  storeName,
}: CheckoutViewProps) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-dashed border-neutral-200 bg-[var(--brand-primary-soft)]/40 px-6 py-12 text-center">
          <p className="font-medium text-neutral-900">Tu carrito está vacío</p>
          <p className="mt-2 text-sm text-neutral-500">
            Agregá productos antes de continuar al checkout.
          </p>
          <Link href="/productos" className="mt-5 inline-block">
            <Button>Ver productos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <StorefrontPageHeader
        title="Checkout"
        description="Completá tus datos para finalizar la compra."
        backHref="/carrito"
        backLabel="Volver al carrito"
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
          <CheckoutForm
            shippingCost={shippingCost}
            allowPickup={allowPickup}
            storeName={storeName}
            showSummary={false}
          />
        </div>

        <aside className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Tu pedido
          </h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto border-b border-neutral-100 pb-4">
            {items.map((item) => (
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
                    {item.size} · {item.color} × {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between text-sm text-neutral-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Envío o retiro según elijas en el formulario.
          </p>
        </aside>
      </div>
    </div>
  );
}
