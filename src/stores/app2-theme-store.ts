"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_APP2_COLOR_THEME,
  type App2ColorThemeId,
} from "@/lib/store-verticals/app2/themes";

type App2ThemeState = {
  themeId: App2ColorThemeId;
  setThemeId: (themeId: App2ColorThemeId) => void;
};

export const useApp2ThemeStore = create<App2ThemeState>()(
  persist(
    (set) => ({
      themeId: DEFAULT_APP2_COLOR_THEME,
      setThemeId: (themeId) => set({ themeId }),
    }),
    { name: "app2-color-theme" },
  ),
);
