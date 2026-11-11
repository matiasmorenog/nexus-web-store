"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useExitPresence } from "@/hooks/use-exit-presence";

type FormCollapsibleProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
  /** Optional view-transition-name for reorder morphs. */
  viewTransitionName?: string;
};

/**
 * Height collapse/expand (0fr↔1fr) with exit keep-mount for form fields.
 */
export function FormCollapsible({
  open,
  children,
  className,
  viewTransitionName,
}: FormCollapsibleProps) {
  const { present, exiting } = useExitPresence(open, 280);
  if (!present) return null;

  const expanded = open && !exiting;

  return (
    <div
      className={cn(
        "form-collapsible",
        expanded ? "form-collapsible-open" : "form-collapsible-exit",
        className,
      )}
      style={
        viewTransitionName
          ? { viewTransitionName: viewTransitionName as string }
          : undefined
      }
      aria-hidden={exiting || undefined}
    >
      <div className="form-collapsible-inner">{children}</div>
    </div>
  );
}
