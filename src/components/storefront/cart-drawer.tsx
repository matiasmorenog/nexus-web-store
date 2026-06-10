"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCartStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Carrito ({totalItems()})</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-neutral-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-neutral-500">
              <ShoppingBag className="mb-3 h-12 w-12 opacity-30" />
              <p>Tu carrito está vacío</p>
              <Button variant="outline" className="mt-4" onClick={onClose}>
                Seguir comprando
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-neutral-500">
                          {item.size} · {item.color}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-neutral-400 hover:text-neutral-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="rounded border p-1 hover:bg-neutral-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="rounded border p-1 hover:bg-neutral-50"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="mb-4 flex justify-between text-base font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
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
      </aside>
    </div>
  );
}
