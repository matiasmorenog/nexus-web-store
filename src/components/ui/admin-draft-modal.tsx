"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shared admin create-draft modal shell (Rocha pattern): portal overlay,
 * minimize via backdrop / Escape (caller), floating chip while minimized.
 */
export function AdminDraftModal({
  open,
  showShell,
  showChip,
  exiting,
  animKey,
  labelledBy,
  onMinimize,
  onResume,
  maxWidthClassName = "max-w-3xl",
  children,
  chip,
  chipClassName,
}: {
  open: boolean;
  showShell: boolean;
  showChip: boolean;
  exiting: boolean;
  animKey: string | number;
  labelledBy: string;
  onMinimize: () => void;
  onResume: () => void;
  maxWidthClassName?: string;
  children: ReactNode;
  chip?: {
    title: string;
    subtitle?: string;
    icon: LucideIcon;
  } | null;
  /** Offset when multiple minimize chips stack (e.g. bottom-20). */
  chipClassName?: string;
}) {
  if (typeof document === "undefined") return null;

  const portalRoot = document.querySelector("[data-admin-ui]") ?? document.body;

  return (
    <>
      {showShell
        ? createPortal(
            <div
              className={cn(
                "fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4",
                !open && "pointer-events-none invisible",
              )}
              aria-hidden={!open}
            >
              <button
                type="button"
                className={cn(
                  "absolute inset-0 bg-neutral-900/45 backdrop-blur-sm transition-opacity duration-200",
                  exiting || !open ? "opacity-0" : "opacity-100",
                )}
                aria-label="Minimizar"
                onClick={onMinimize}
                tabIndex={open ? 0 : -1}
              />
              <div
                key={animKey}
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                className={cn(
                  "relative z-[1] flex w-full flex-col overflow-hidden rounded-t-xl border border-neutral-200/80 bg-white shadow-xl sm:rounded-xl",
                  maxWidthClassName,
                  exiting ? "admin-draft-modal-exit" : "admin-draft-modal-enter",
                )}
              >
                {children}
              </div>
            </div>,
            portalRoot,
          )
        : null}

      {showChip && chip
        ? createPortal(
            <button
              type="button"
              onClick={onResume}
              className={cn(
                "fixed right-4 z-[95] flex max-w-[min(100vw-2rem,20rem)] items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-left text-sm shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]",
                chipClassName ?? "bottom-4",
              )}
            >
              <chip.icon
                className="h-4 w-4 shrink-0 text-[var(--brand-primary)]"
                aria-hidden
              />
              <span className="min-w-0">
                <span className="block font-medium text-neutral-900">
                  {chip.title}
                </span>
                {chip.subtitle ? (
                  <span className="block truncate text-xs text-neutral-500">
                    {chip.subtitle}
                  </span>
                ) : null}
              </span>
            </button>,
            portalRoot,
          )
        : null}
    </>
  );
}

export function AdminDraftModalHeader({
  titleId,
  title,
  description,
}: {
  titleId: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="shrink-0 border-b border-neutral-100 bg-neutral-50/50 px-4 py-3 sm:px-5">
      <h2 id={titleId} className="text-lg font-semibold text-neutral-900">
        {title}
      </h2>
      {description ? (
        <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
      ) : null}
    </div>
  );
}

export function AdminDraftModalBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminDraftModalFooter({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-neutral-100 bg-neutral-50/50 px-4 py-3 sm:px-5">
      {children}
    </div>
  );
}

export function AdminDraftTrigger({
  onClick,
  pending = false,
  idleLabel,
  pendingLabel,
  icon: Icon,
  size = "sm",
  className,
}: {
  onClick: () => void;
  pending?: boolean;
  itemCount?: number;
  idleLabel: string;
  pendingLabel: string;
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <Button
      type="button"
      size={size}
      onClick={onClick}
      className={className}
      aria-label={pending ? `${pendingLabel} (borrador pendiente)` : idleLabel}
    >
      <Icon className="mr-1.5 h-4 w-4" aria-hidden />
      {pending ? pendingLabel : idleLabel}
      {pending ? (
        <span
          className="ml-2 size-2 shrink-0 rounded-full bg-current opacity-90"
          aria-hidden
        />
      ) : null}
    </Button>
  );
}
