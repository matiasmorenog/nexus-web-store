"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  getVapeThemeCssVars,
  type VapeColorThemeId,
} from "@/lib/store-verticals/vape/themes";
import { useVapeThemeStore } from "@/stores/vape-theme-store";
import { cn } from "@/lib/utils";
import "@/themes/vape/styles/theme.css";

type VapeThemeShellProps = {
  children: ReactNode;
  className?: string;
  /** Vars base del servidor (tema Cyber por defecto). */
  initialCssVars: Record<string, string>;
  /** Tema elegido en admin (módulo premium). */
  storeThemeId?: VapeColorThemeId;
  /** Si el visitante puede cambiar el tema con el toggle del header. */
  allowCustomerThemeToggle?: boolean;
};

export function VapeThemeShell({
  children,
  className,
  initialCssVars,
  storeThemeId,
  allowCustomerThemeToggle = true,
}: VapeThemeShellProps) {
  const persistedThemeId = useVapeThemeStore((s) => s.themeId);
  const setThemeId = useVapeThemeStore((s) => s.setThemeId);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (storeThemeId) {
      setThemeId(storeThemeId);
    }
  }, [setThemeId, storeThemeId]);

  const themeId = allowCustomerThemeToggle
    ? persistedThemeId
    : (storeThemeId ?? persistedThemeId);

  const style = useMemo(() => {
    const themeVars = getVapeThemeCssVars(themeId);
    return {
      ...initialCssVars,
      ...themeVars,
      // El toggle de tema tiene prioridad sobre primaryColor de DB en vape.
      "--brand-primary": themeVars["--brand-primary"],
    } as CSSProperties;
  }, [initialCssVars, themeId]);

  return (
    <div
      data-storefront-ui="vape"
      data-vape-theme={ready ? themeId : undefined}
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
