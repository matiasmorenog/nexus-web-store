"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CartEmptyState } from "@/components/storefront/cart-empty-state";
import { CartLineItem } from "@/components/storefront/cart-line-item";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } =
    useCartStore();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/productos"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-[var(--brand-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Seguir comprando
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-0.5">
            Carrito
          </span>
        </h1>
        {items.length > 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            {totalItems()} artículo{totalItems() !== 1 ? "s" : ""} en tu pedido
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <CartEmptyState />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
          <ul className="space-y-4">
            {items.map((item) => (
              <CartLineItem
                key={item.variantId}
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
            ))}
          </ul>

          <aside className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Resumen
            </h2>
            <div className="mt-4 space-y-2 border-b border-neutral-100 pb-4 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Envío</span>
                <span className="text-neutral-400">En checkout</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-medium text-neutral-900">Total estimado</span>
              <span className="text-xl font-bold text-neutral-900">
                {formatPrice(subtotal())}
              </span>
            </div>
            <Link href="/checkout" className="mt-5 block">
              <Button size="lg" className="w-full">
                Continuar al checkout
              </Button>
            </Link>
            <p className="mt-3 text-center text-xs text-neutral-400">
              Pagá de forma segura con Mercado Pago
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
