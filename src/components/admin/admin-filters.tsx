"use client";

import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AdminSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  placeholder?: string;
  ariaLabel?: string;
};

export function AdminSearchField({
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = "Buscar...",
  ariaLabel = "Buscar",
}: AdminSearchFieldProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-3"
      role="search"
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden
        />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-9 pr-8"
          aria-label={ariaLabel}
        />
        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-700"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function AdminSummaryRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

export function AdminFilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-[var(--brand-primary-soft)] font-medium text-[var(--brand-primary)]"
          : "text-neutral-700 hover:bg-neutral-50",
      )}
    >
      <span>{label}</span>
      <span>{count}</span>
    </button>
  );
}

export function AdminFilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-neutral-100 px-4 py-3">
      <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-400">
        {title}
      </Label>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function AdminClearFiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="border-t border-neutral-100 px-4 py-3">
      <button
        type="button"
        onClick={onClick}
        className="text-sm text-neutral-500 transition-colors hover:text-[var(--brand-primary)]"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
