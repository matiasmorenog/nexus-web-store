"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string;
  minPrice: number;
  addedAt: number;
};

type WishlistState = {
  items: WishlistItem[];
  toggleItem: (item: Omit<WishlistItem, "addedAt">) => boolean;
  removeItem: (productId: string) => void;
  setItems: (items: WishlistItem[]) => void;
  hasItem: (productId: string) => boolean;
  totalItems: () => number;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (item) => {
        const exists = get().items.some((entry) => entry.productId === item.productId);

        if (exists) {
          set((state) => ({
            items: state.items.filter((entry) => entry.productId !== item.productId),
          }));
          return false;
        }

        set((state) => ({
          items: [
            {
              ...item,
              addedAt: Date.now(),
            },
            ...state.items,
          ],
        }));
        return true;
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((entry) => entry.productId !== productId),
        })),
      setItems: (items) => set({ items }),
      hasItem: (productId) =>
        get().items.some((entry) => entry.productId === productId),
      totalItems: () => get().items.length,
    }),
    { name: "nexus-wishlist" },
  ),
);
