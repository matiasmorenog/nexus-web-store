"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { useAnchoredFloatingStyle } from "@/hooks/use-anchored-floating-style";
import { useExitPresence } from "@/hooks/use-exit-presence";
import { useIsClient } from "@/hooks/use-is-client";
import {
  BRAND_BORDER_ACTIVE,
  FOCUS_BRAND_BORDER,
} from "@/lib/focus-styles";
import { cn } from "@/lib/utils";

export type MenuSelectOption = {
  value: string;
  label: string;
};

type MenuSelectProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly MenuSelectOption[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
  "aria-label"?: string;
  placeholder?: string;
};

export function MenuSelect({
  id,
  name,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
  className,
  "aria-label": ariaLabel,
  placeholder = "Elegir…",
}: MenuSelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const isClient = useIsClient();
  const { present, exiting, animKey } = useExitPresence(open);
  const floatingStyle = useAnchoredFloatingStyle(triggerRef, present, {
    minWidthPx: 160,
  });

  const selected =
    options.find((option) => option.value === value) ?? null;
  const selectedIndex = options.findIndex((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (!listRef.current) return;
      const items = Array.from(
        listRef.current.querySelectorAll<HTMLButtonElement>("[data-menu-option]"),
      );
      if (items.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      const currentIndex = items.findIndex((item) => item === active);
      const startIndex = currentIndex >= 0 ? currentIndex : Math.max(0, selectedIndex);

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = items[Math.min(items.length - 1, startIndex + 1)];
        next?.focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const next = items[Math.max(0, startIndex - 1)];
        next?.focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        items[0]?.focus();
      } else if (event.key === "End") {
        event.preventDefault();
        items[items.length - 1]?.focus();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open || !present) return;
    const frame = window.requestAnimationFrame(() => {
      const selectedButton = listRef.current?.querySelector<HTMLButtonElement>(
        '[data-menu-option][aria-selected="true"]',
      );
      (selectedButton ?? listRef.current?.querySelector<HTMLButtonElement>("[data-menu-option]"))
        ?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, present, animKey]);

  return (
    <div className={cn("relative w-full", className)}>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value}
          disabled={disabled}
          required={required}
        />
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={panelId}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-left text-sm text-neutral-900",
          FOCUS_BRAND_BORDER,
          open && BRAND_BORDER_ACTIVE,
          "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500",
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            !selected && "text-neutral-400",
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-neutral-500 transition-transform",
            open && "rotate-180 text-[var(--brand-primary)]",
          )}
          aria-hidden
        />
      </button>

      {isClient && present && floatingStyle
        ? createPortal(
            <div
              key={animKey}
              ref={panelRef}
              id={panelId}
              role="listbox"
              aria-label={ariaLabel}
              aria-hidden={exiting || undefined}
              style={floatingStyle}
              className={cn(
                "overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg",
                exiting
                  ? "admin-picker-float-exit pointer-events-none"
                  : "admin-picker-float-enter",
              )}
            >
              <div ref={listRef} className="max-h-60 overflow-y-auto p-1">
                {options.map((option) => {
                  const active = option.value === value;
                  return (
                    <button
                      key={option.value || "__empty"}
                      type="button"
                      role="option"
                      data-menu-option
                      aria-selected={active}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                        "focus:outline-none focus-visible:bg-[var(--brand-primary-soft)] focus-visible:text-[var(--brand-primary)]",
                        active
                          ? "bg-[var(--brand-primary-soft)] font-medium text-[var(--brand-primary)]"
                          : "text-neutral-800 hover:bg-neutral-50",
                      )}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                        triggerRef.current?.focus();
                      }}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                      {active ? (
                        <Check
                          className="size-4 shrink-0 text-[var(--brand-primary)]"
                          aria-hidden
                        />
                      ) : (
                        <span className="size-4 shrink-0" aria-hidden />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
