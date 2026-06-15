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
  onBlockedToggle?: () => void;
  className?: string;
  animate?: boolean;
  contentClassName?: string;
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
  onBlockedToggle,
  className,
  animate = true,
  contentClassName,
}: AdminCollapsibleCardProps) {
  const content = children ? (
    animate ? (
      <AdminMotion key={contentId} variant="inline">
        {children}
      </AdminMotion>
    ) : (
      children
    )
  ) : null;

  return (
    <div className={cn(adminCardClass, className)}>
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-stretch",
          disabled && "bg-neutral-100/50",
        )}
      >
        <button
          type="button"
          onClick={() => {
            if (disabled) {
              onBlockedToggle?.();
              return;
            }
            onToggle();
          }}
          aria-expanded={open}
          aria-controls={contentId}
          aria-disabled={disabled}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-4 text-left transition-colors sm:border-b-0",
            adminCardHeaderClass,
            disabled && "border-b-transparent bg-transparent",
            !disabled && "cursor-pointer hover:bg-neutral-100/70",
            disabled && "cursor-not-allowed",
          )}
        >
          {open ? (
            <ChevronUp
              className={cn(
                "h-8 w-8 shrink-0",
                disabled ? "text-neutral-300" : "text-neutral-400",
              )}
              strokeWidth={2}
              aria-hidden
            />
          ) : (
            <ChevronDown
              className={cn(
                "h-8 w-8 shrink-0",
                disabled ? "text-neutral-300" : "text-neutral-400",
              )}
              strokeWidth={2}
              aria-hidden
            />
          )}
          <div className="min-w-0">
            <h2
              className={cn(
                "font-semibold",
                disabled ? "text-neutral-400" : "text-neutral-900",
              )}
            >
              {title}
            </h2>
            <p
              className={cn(
                "mt-1 text-sm",
                disabled ? "text-neutral-400" : "text-neutral-500",
              )}
            >
              {description}
            </p>
          </div>
        </button>

        {action ? (
          <div
            className={cn(
              "flex items-center sm:border-b-0 sm:border-l",
              adminCardHeaderClass,
              "py-3 sm:py-4",
              disabled && "border-l-neutral-200/70 bg-transparent",
            )}
            onClick={(e) => e.stopPropagation()}
            onClickCapture={
              disabled
                ? () => {
                    onBlockedToggle?.();
                  }
                : undefined
            }
          >
            {action}
          </div>
        ) : null}
      </div>

      {open ? <div className={cn(contentClassName)}>{content}</div> : null}
    </div>
  );
}
