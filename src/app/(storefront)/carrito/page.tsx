"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold">Carrito</h1>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-neutral-500">Tu carrito está vacío</p>
          <Link href="/productos">
            <Button className="mt-4">Ver productos</Button>
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-4 py-4">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <Link href={`/producto/${item.productSlug}`} className="font-medium hover:underline">
                        {item.productName}
                      </Link>
                      <p className="text-sm text-neutral-500">
                        {item.size} · {item.color}
                      </p>
                    </div>
                    <button onClick={() => removeItem(item.variantId)}>
                      <X className="h-4 w-4 text-neutral-400" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="rounded border p-1"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="rounded border p-1"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            <Link href="/checkout">
              <Button size="lg" className="mt-4 w-full">
                Continuar al checkout
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
