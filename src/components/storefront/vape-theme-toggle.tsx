"use client";

import { VAPE_COLOR_THEME_IDS, getVapeTheme } from "@/lib/store-verticals/vape/themes";
import { useVapeThemeStore } from "@/stores/vape-theme-store";
import { cn } from "@/lib/utils";

type VapeThemeToggleProps = {
  className?: string;
  /** Solo ícono de color — para el header en pantallas chicas */
  compact?: boolean;
};

export function VapeThemeToggle({ className, compact = false }: VapeThemeToggleProps) {
  const themeId = useVapeThemeStore((s) => s.themeId);
  const setThemeId = useVapeThemeStore((s) => s.setThemeId);

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-[var(--vape-theme-border)] bg-[color-mix(in_srgb,var(--brand-primary-dark)_40%,transparent)] p-1",
        className,
      )}
      role="group"
      aria-label="Tema de color"
    >
      {VAPE_COLOR_THEME_IDS.map((id) => {
        const theme = getVapeTheme(id);
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
                : "text-vape-muted hover:text-[var(--brand-primary-light)]",
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
