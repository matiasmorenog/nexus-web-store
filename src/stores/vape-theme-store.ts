"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_VAPE_COLOR_THEME,
  type VapeColorThemeId,
} from "@/lib/store-verticals/vape/themes";

type VapeThemeState = {
  themeId: VapeColorThemeId;
  setThemeId: (themeId: VapeColorThemeId) => void;
};

export const useVapeThemeStore = create<VapeThemeState>()(
  persist(
    (set) => ({
      themeId: DEFAULT_VAPE_COLOR_THEME,
      setThemeId: (themeId) => set({ themeId }),
    }),
    { name: "vape-color-theme" },
  ),
);
