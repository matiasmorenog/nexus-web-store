"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/stores/wishlist-store";

export function WishlistSync() {
  const { data: session, status } = useSession();
  const setItems = useWishlistStore((state) => state.setItems);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "CUSTOMER") {
      syncedRef.current = false;
      return;
    }

    if (syncedRef.current) return;
    syncedRef.current = true;

    const sync = async () => {
      try {
        const localIds = useWishlistStore
          .getState()
          .items.map((item) => item.productId);
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            action: "sync",
            productIds: localIds,
          }),
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          items: {
            productId: string;
            productSlug: string;
            productName: string;
            imageUrl: string;
            minPrice: number;
            addedAt: string;
          }[];
        };

        const merged = new Map(
          useWishlistStore.getState().items.map((item) => [item.productId, item] as const),
        );

        for (const item of data.items) {
          merged.set(item.productId, {
            productId: item.productId,
            productSlug: item.productSlug,
            productName: item.productName,
            imageUrl: item.imageUrl,
            minPrice: item.minPrice,
            addedAt: new Date(item.addedAt).getTime(),
          });
        }

        setItems(
          [...merged.values()].sort((a, b) => b.addedAt - a.addedAt),
        );
      } catch {
        syncedRef.current = false;
      }
    };

    void sync();
  }, [session?.user?.role, setItems, status]);

  return null;
}

async function persistWishlistChange(
  productId: string,
  action: "add" | "remove",
) {
  await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ productId, action }),
  });
}

export async function syncWishlistToggle(
  sessionRole: string | undefined,
  productId: string,
  added: boolean,
) {
  if (sessionRole !== "CUSTOMER") return;

  try {
    await persistWishlistChange(productId, added ? "add" : "remove");
  } catch {
    // La copia local sigue disponible aunque falle el servidor.
  }
}
