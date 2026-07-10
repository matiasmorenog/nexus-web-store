"use client";

import type { CSSProperties, ReactNode } from "react";
import { useHydrated } from "@/lib/use-hydrated";
import { useEffect, useMemo } from "react";
import {
  getApp2ThemeCssVars,
  type App2ColorThemeId,
} from "@/lib/store-verticals/app2/themes";
import { useApp2ThemeStore } from "@/stores/app2-theme-store";
import { cn } from "@/lib/utils";
import "@/themes/app2/styles/theme.css";

type App2ThemeShellProps = {
  children: ReactNode;
  className?: string;
  /** Vars base del servidor (tema Cyber por defecto). */
  initialCssVars: Record<string, string>;
  /** Tema elegido en admin (módulo premium). */
  storeThemeId?: App2ColorThemeId;
  /** Si el visitante puede cambiar el tema con el toggle del header. */
  allowCustomerThemeToggle?: boolean;
};

export function App2ThemeShell({
  children,
  className,
  initialCssVars,
  storeThemeId,
  allowCustomerThemeToggle = true,
}: App2ThemeShellProps) {
  const persistedThemeId = useApp2ThemeStore((s) => s.themeId);
  const setThemeId = useApp2ThemeStore((s) => s.setThemeId);
  const ready = useHydrated();

  useEffect(() => {
    if (storeThemeId) {
      setThemeId(storeThemeId);
    }
  }, [setThemeId, storeThemeId]);

  const themeId = allowCustomerThemeToggle
    ? persistedThemeId
    : (storeThemeId ?? persistedThemeId);

  const style = useMemo(() => {
    const themeVars = getApp2ThemeCssVars(themeId);
    return {
      ...initialCssVars,
      ...themeVars,
      // El toggle de tema tiene prioridad sobre primaryColor de DB en app2.
      "--brand-primary": themeVars["--brand-primary"],
    } as CSSProperties;
  }, [initialCssVars, themeId]);

  return (
    <div
      data-storefront-ui="app2"
      data-app2-theme={ready ? themeId : undefined}
      style={style}
      className={cn(
        "storefront-theme relative flex min-h-full flex-1 flex-col bg-[var(--storefront-bg)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
