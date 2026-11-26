"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AdminCreateDraftKind = "product" | "category";

export type AdminCreateDraftSlot = {
  open: boolean;
  /** Keep modal shell/chip alive across routes while dirty. */
  sessionActive: boolean;
  pending: boolean;
  itemCount: number;
  chipSubtitle: string;
  /** Text field snapshot (no File uploads). */
  values: Record<string, string>;
  audiences: string[];
  hasSize: boolean | null;
};

const emptySlot = (): AdminCreateDraftSlot => ({
  open: false,
  sessionActive: false,
  pending: false,
  itemCount: 0,
  chipSubtitle: "",
  values: {},
  audiences: [],
  hasSize: null,
});

type AdminCreateDraftState = {
  product: AdminCreateDraftSlot;
  category: AdminCreateDraftSlot;
  openDraft: (kind: AdminCreateDraftKind) => void;
  setOpen: (kind: AdminCreateDraftKind, open: boolean) => void;
  setSessionMeta: (
    kind: AdminCreateDraftKind,
    meta: { pending: boolean; itemCount: number; chipSubtitle?: string },
  ) => void;
  setSessionActive: (kind: AdminCreateDraftKind, active: boolean) => void;
  patchValues: (
    kind: AdminCreateDraftKind,
    values: Record<string, string>,
  ) => void;
  setAudiences: (audiences: string[]) => void;
  setHasSize: (hasSize: boolean) => void;
  clearDraft: (kind: AdminCreateDraftKind) => void;
};

function updateSlot(
  state: AdminCreateDraftState,
  kind: AdminCreateDraftKind,
  patch: Partial<AdminCreateDraftSlot>,
): Partial<AdminCreateDraftState> {
  return { [kind]: { ...state[kind], ...patch } };
}

export const useAdminCreateDraftStore = create<AdminCreateDraftState>()(
  persist(
    (set) => ({
      product: emptySlot(),
      category: emptySlot(),

      openDraft: (kind) =>
        set((state) =>
          updateSlot(state, kind, { open: true, sessionActive: true }),
        ),

      setOpen: (kind, open) =>
        set((state) => {
          const slot = state[kind];
          if (open) {
            return updateSlot(state, kind, { open: true, sessionActive: true });
          }
          // Minimize: keep session only if dirty/pending.
          const keep = slot.pending || slot.itemCount > 0;
          return updateSlot(state, kind, {
            open: false,
            sessionActive: keep ? true : false,
            pending: keep ? slot.pending : false,
          });
        }),

      setSessionMeta: (kind, meta) =>
        set((state) =>
          updateSlot(state, kind, {
            pending: meta.pending,
            itemCount: meta.itemCount,
            chipSubtitle: meta.chipSubtitle ?? state[kind].chipSubtitle,
            sessionActive:
              meta.pending || meta.itemCount > 0 || state[kind].open
                ? true
                : state[kind].sessionActive,
          }),
        ),

      setSessionActive: (kind, active) =>
        set((state) => updateSlot(state, kind, { sessionActive: active })),

      patchValues: (kind, values) =>
        set((state) =>
          updateSlot(state, kind, {
            values: { ...state[kind].values, ...values },
          }),
        ),

      setAudiences: (audiences) =>
        set((state) => updateSlot(state, "category", { audiences })),

      setHasSize: (hasSize) =>
        set((state) => updateSlot(state, "product", { hasSize })),

      clearDraft: (kind) => set(() => ({ [kind]: emptySlot() })),
    }),
    {
      name: "nexus-admin-create-drafts",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        product: state.product,
        category: state.category,
      }),
    },
  ),
);

export function adminCreateDraftPending(
  kind: AdminCreateDraftKind,
): boolean {
  return useAdminCreateDraftStore.getState()[kind].pending;
}
