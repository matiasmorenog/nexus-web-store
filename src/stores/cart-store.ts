"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getCartPromoPricing } from "@/lib/promo-2x1";

export type CartItem = {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  size: string;
  color: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
  promo2x1?: boolean;
};

type CartState = {
  items: CartItem[];
  lastAddedAt: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  rawSubtotal: () => number;
  promoDiscount: () => number;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      lastAddedAt: 0,
      addItem: (item) => {
        const quantity = item.quantity ?? 1;
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            const newQty = Math.min(existing.quantity + quantity, item.stock);
            return {
              lastAddedAt: Date.now(),
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? {
                      ...i,
                      quantity: newQty,
                      promo2x1: item.promo2x1 ?? i.promo2x1,
                    }
                  : i,
              ),
            };
          }
          return {
            lastAddedAt: Date.now(),
            items: [...state.items, { ...item, quantity: Math.min(quantity, item.stock) }],
          };
        });
      },
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
              : i,
          ),
        })),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      rawSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      promoDiscount: () => getCartPromoPricing(get().items).promoDiscount,
      subtotal: () => getCartPromoPricing(get().items).subtotal,
    }),
    { name: "nexus-cart" },
  ),
);
