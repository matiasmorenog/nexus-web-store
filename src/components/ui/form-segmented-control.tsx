"use client";

import { cn } from "@/lib/utils";

/**
 * `card` — inside white cards (chart header): no outer shadow.
 * `page` — on admin grey canvas: light shadow so the control doesn’t blend.
 */
export type SegmentedSurface = "card" | "page";

export function segmentedTrackClassName(
  surface: SegmentedSurface = "card",
): string {
  return cn(
    "flex select-none gap-1 rounded-lg border border-neutral-200 bg-transparent p-1",
    surface === "page" && "bg-white shadow-sm",
  );
}

/** Active = brand text + bold only (no fill / border chip). */
export function segmentedItemClassName(
  active: boolean,
  size: "sm" | "md" = "sm",
): string {
  return cn(
    "select-none rounded-md transition-colors",
    size === "sm"
      ? "px-2.5 py-1.5 text-xs sm:px-3 sm:text-sm"
      : "flex-1 px-3 py-2 text-sm",
    active
      ? "cursor-pointer font-semibold text-[var(--brand-primary)]"
      : "cursor-pointer font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800",
  );
}

export type FormSegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type FormSegmentedControlProps<T extends string> = {
  id?: string;
  name?: string;
  value: T;
  options: readonly FormSegmentedOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

/**
 * Two+ option segmented control for forms (idioma-style tabs, Input height/border).
 */
export function FormSegmentedControl<T extends string>({
  id,
  name,
  value,
  options,
  onChange,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: FormSegmentedControlProps<T>) {
  return (
    <div className={cn("w-full", className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <div
        id={id}
        role="group"
        aria-label={ariaLabel}
        className={cn(
          segmentedTrackClassName("card"),
          "h-10 rounded-md border-neutral-300",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => {
                if (!disabled && option.value !== value) onChange(option.value);
              }}
              className={cn(
                "min-w-0",
                segmentedItemClassName(active, "md"),
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1",
                disabled && "pointer-events-none",
              )}
            >
              <span className="block truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
