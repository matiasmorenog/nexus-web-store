"use client";

import { useEffect } from "react";
import { usePromoConfigStore } from "@/stores/promo-config-store";

type PromoConfigSyncProps = {
  promo2x1Active: boolean;
};

/** Propaga el estado 2x1 del servidor al store de cliente (carrito). */
export function PromoConfigSync({ promo2x1Active }: PromoConfigSyncProps) {
  const setPromo2x1Active = usePromoConfigStore((s) => s.setPromo2x1Active);

  useEffect(() => {
    setPromo2x1Active(promo2x1Active);
  }, [promo2x1Active, setPromo2x1Active]);

  return null;
}
