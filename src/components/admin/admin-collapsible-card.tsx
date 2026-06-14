"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { AdminMotion } from "@/components/admin/admin-motion";
import { adminCardClass, adminCardHeaderClass } from "@/components/admin/admin-surface";
import { cn } from "@/lib/utils";

type AdminCollapsibleCardProps = {
  open: boolean;
  onToggle: () => void;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  contentId?: string;
  disabled?: boolean;
  className?: string;
  animate?: boolean;
};

export function AdminCollapsibleCard({
  open,
  onToggle,
  title,
  description,
  action,
  children,
  contentId,
  disabled = false,
  className,
  animate = true,
}: AdminCollapsibleCardProps) {
  const content = children ? (
    animate ? <AdminMotion variant="inline">{children}</AdminMotion> : children
  ) : null;

  return (
    <div className={cn(adminCardClass, className)}>
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-expanded={open}
          aria-controls={contentId}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-4 text-left transition-colors sm:border-b-0",
            adminCardHeaderClass,
            !disabled && "cursor-pointer hover:bg-neutral-100/70",
            disabled && "cursor-not-allowed opacity-80",
          )}
        >
          {open ? (
            <ChevronUp
              className="h-8 w-8 shrink-0 text-neutral-400"
              strokeWidth={2}
              aria-hidden
            />
          ) : (
            <ChevronDown
              className="h-8 w-8 shrink-0 text-neutral-400"
              strokeWidth={2}
              aria-hidden
            />
          )}
          <div className="min-w-0">
            <h2 className="font-semibold text-neutral-900">{title}</h2>
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          </div>
        </button>

        {action ? (
          <div
            className={cn(
              "flex items-center sm:border-b-0 sm:border-l",
              adminCardHeaderClass,
              "py-3 sm:py-4",
            )}
          >
            {action}
          </div>
        ) : null}
      </div>

      {open ? content : null}
    </div>
  );
}
