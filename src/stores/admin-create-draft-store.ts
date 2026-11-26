"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AdminCreateDraftSlot = {
  open: boolean;
  /** Keep modal shell/chip alive across routes while dirty. */
  sessionActive: boolean;
  pending: boolean;
  itemCount: number;
  chipSubtitle: string;
  /** Text field snapshot (no File uploads). */
  values: Record<string, string>;
  hasSize: boolean | null;
};

const emptySlot = (): AdminCreateDraftSlot => ({
  open: false,
  sessionActive: false,
  pending: false,
  itemCount: 0,
  chipSubtitle: "",
  values: {},
  hasSize: null,
});

type AdminCreateDraftState = {
  product: AdminCreateDraftSlot;
  openDraft: () => void;
  setOpen: (open: boolean) => void;
  setSessionMeta: (meta: {
    pending: boolean;
    itemCount: number;
    chipSubtitle?: string;
  }) => void;
  setSessionActive: (active: boolean) => void;
  patchValues: (values: Record<string, string>) => void;
  setHasSize: (hasSize: boolean) => void;
  clearDraft: () => void;
};

export const useAdminCreateDraftStore = create<AdminCreateDraftState>()(
  persist(
    (set) => ({
      product: emptySlot(),

      openDraft: () =>
        set((state) => ({
          product: { ...state.product, open: true, sessionActive: true },
        })),

      setOpen: (open) =>
        set((state) => {
          const slot = state.product;
          if (open) {
            return {
              product: { ...slot, open: true, sessionActive: true },
            };
          }
          const keep = slot.pending || slot.itemCount > 0;
          return {
            product: {
              ...slot,
              open: false,
              sessionActive: keep,
              pending: keep ? slot.pending : false,
            },
          };
        }),

      setSessionMeta: (meta) =>
        set((state) => {
          const slot = state.product;
          return {
            product: {
              ...slot,
              pending: meta.pending,
              itemCount: meta.itemCount,
              chipSubtitle: meta.chipSubtitle ?? slot.chipSubtitle,
              sessionActive:
                meta.pending || meta.itemCount > 0 || slot.open
                  ? true
                  : slot.sessionActive,
            },
          };
        }),

      setSessionActive: (active) =>
        set((state) => ({
          product: { ...state.product, sessionActive: active },
        })),

      patchValues: (values) =>
        set((state) => ({
          product: {
            ...state.product,
            values: { ...state.product.values, ...values },
          },
        })),

      setHasSize: (hasSize) =>
        set((state) => ({
          product: { ...state.product, hasSize },
        })),

      clearDraft: () => set({ product: emptySlot() }),
    }),
    {
      name: "nexus-admin-create-drafts",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        product: state.product,
      }),
      // Drop legacy category drafts from earlier persist shape.
      merge: (persisted, current) => {
        const raw = persisted as { product?: AdminCreateDraftSlot } | undefined;
        return {
          ...current,
          product: raw?.product ? { ...emptySlot(), ...raw.product } : current.product,
        };
      },
    },
  ),
);
