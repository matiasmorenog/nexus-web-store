"use client";

import { create } from "zustand";
import type {
  CrmCustomerListItem,
  CrmListFilters,
  CrmSegment,
  CrmStoreStats,
} from "@/lib/crm/types";

export type CrmListSnapshot = {
  cacheKey: string;
  filters: CrmListFilters;
  activeSegmentId: string | null;
  listHref: string;
  customers: CrmCustomerListItem[];
  stats: CrmStoreStats;
  tags: string[];
  segments: CrmSegment[];
};

type CrmListState = {
  byKey: Record<string, CrmListSnapshot>;
  setSnapshot: (snapshot: CrmListSnapshot) => void;
};

export const useCrmListStore = create<CrmListState>((set) => ({
  byKey: {},
  setSnapshot: (snapshot) =>
    set((state) => ({
      byKey: {
        ...state.byKey,
        [snapshot.cacheKey]: snapshot,
      },
    })),
}));
