import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const adminSurfaceClass =
  "rounded-xl border border-neutral-200/80 bg-white shadow-sm";

export const adminCardClass = cn(adminSurfaceClass, "overflow-hidden");

export const adminCardHeaderClass =
  "border-b border-neutral-100 bg-neutral-50/50 px-4 py-4 sm:px-6";

/** Contenedor exterior del form en row edits y hints bloqueados (mismo padding que la celda). */
export const adminBlockedEditShellClass =
  "bg-neutral-50/80 px-4 py-4 sm:px-6";

export const adminCardInsetClass = "px-4 sm:px-6";

type AdminCardSectionProps = {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
};

export function AdminCardSection({
  children,
  className,
  bordered = true,
}: AdminCardSectionProps) {
  return (
    <div
      className={cn(
        adminCardInsetClass,
        "py-4",
        bordered && "border-b border-neutral-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

type AdminCardFooterProps = {
  children: ReactNode;
  className?: string;
};

export function AdminCardFooter({ children, className }: AdminCardFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 bg-neutral-50/50 px-4 py-3 sm:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminDetailGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>
  );
}

export function AdminDetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <div className="mt-1 text-sm text-neutral-700">{children}</div>
    </div>
  );
}

export function AdminEmptyState({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("py-8 text-center text-neutral-500", className)}>
      {children}
    </p>
  );
}
