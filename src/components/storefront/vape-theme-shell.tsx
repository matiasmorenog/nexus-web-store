"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { getVapeThemeCssVars } from "@/lib/store-verticals/vape/themes";
import { useVapeThemeStore } from "@/stores/vape-theme-store";
import { cn } from "@/lib/utils";

type VapeThemeShellProps = {
  children: ReactNode;
  className?: string;
  /** Vars base del servidor (tema Cyber por defecto). */
  initialCssVars: Record<string, string>;
};

export function VapeThemeShell({
  children,
  className,
  initialCssVars,
}: VapeThemeShellProps) {
  const themeId = useVapeThemeStore((s) => s.themeId);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

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
