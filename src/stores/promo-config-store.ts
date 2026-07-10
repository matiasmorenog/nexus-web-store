"use client";

import { create } from "zustand";

type PromoConfigState = {
  /** 2x1 activo para la tienda (módulo coupons + toggle en admin). */
  promo2x1Active: boolean;
  setPromo2x1Active: (active: boolean) => void;
};

export const usePromoConfigStore = create<PromoConfigState>((set) => ({
  promo2x1Active: false,
  setPromo2x1Active: (promo2x1Active) => set({ promo2x1Active }),
}));
