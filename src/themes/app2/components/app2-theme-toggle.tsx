"use client";

import { APP2_COLOR_THEME_IDS, getApp2Theme } from "@/lib/store-verticals/app2/themes";
import { useApp2ThemeStore } from "@/stores/app2-theme-store";
import { cn } from "@/lib/utils";

type App2ThemeToggleProps = {
  className?: string;
  /** Solo ícono de color — para el header en pantallas chicas */
  compact?: boolean;
};

export function App2ThemeToggle({ className, compact = false }: App2ThemeToggleProps) {
  const themeId = useApp2ThemeStore((s) => s.themeId);
  const setThemeId = useApp2ThemeStore((s) => s.setThemeId);

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-[var(--app2-theme-border)] bg-[color-mix(in_srgb,var(--brand-primary-dark)_40%,transparent)] p-1",
        className,
      )}
      role="group"
      aria-label="Tema de color"
    >
      {APP2_COLOR_THEME_IDS.map((id) => {
        const theme = getApp2Theme(id);
        const active = themeId === id;

        return (
          <button
            key={id}
            type="button"
            title={theme.label}
            aria-label={theme.label}
            aria-pressed={active}
            onClick={() => setThemeId(id)}
            className={cn(
              "flex items-center justify-center rounded-full font-medium transition-all duration-200",
              compact ? "h-8 w-8" : "gap-1.5 px-2.5 py-1 text-xs",
              active
                ? "bg-[var(--brand-primary)] text-[var(--ui-button-primary-foreground)]"
                : "text-app2-muted hover:text-[var(--brand-primary-light)]",
            )}
          >
            <span
              className={cn(
                "inline-block rounded-full",
                compact ? "h-2.5 w-2.5" : "h-2 w-2",
              )}
              style={{ background: theme.swatch }}
              aria-hidden
            />
            {!compact ? theme.label : null}
          </button>
        );
      })}
    </div>
  );
}
