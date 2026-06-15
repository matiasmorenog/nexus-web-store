"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BlockedEditHintProps = {
  blockedHint?: number;
  children: ReactNode;
  className?: string;
};

export function BlockedEditHint({
  blockedHint = 0,
  children,
  className,
}: BlockedEditHintProps) {
  const [flash, setFlash] = useState(false);
  const seenHintRef = useRef<number | null>(null);

  useEffect(() => {
    if (seenHintRef.current === null) {
      seenHintRef.current = blockedHint;
      return;
    }

    if (blockedHint <= seenHintRef.current) return;

    seenHintRef.current = blockedHint;
    setFlash(true);
    const timeout = window.setTimeout(() => setFlash(false), 560);
    return () => window.clearTimeout(timeout);
  }, [blockedHint]);

  return (
    <div
      className={cn(
        "rounded-lg p-2 sm:p-3",
        className,
        flash && "admin-blocked-edit-hint",
      )}
    >
      {children}
    </div>
  );
}

export function RowEditEnter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("admin-row-edit-enter", className)}>{children}</div>;
}

type AdminMotionProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "panel" | "inline" | "row-expand";
};

export function AdminMotion({
  children,
  className,
  variant = "panel",
}: AdminMotionProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let frame2 = 0;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);
    };
  }, []);

  if (variant === "row-expand") {
    return (
      <div
        className={cn(
          animate ? "admin-table-row-expand-enter" : "admin-table-row-expand-prep",
          className,
        )}
      >
        <div className="admin-table-row-expand-inner">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        animate
          ? variant === "panel"
            ? "admin-panel-enter"
            : "admin-inline-form-enter"
          : variant === "panel"
            ? "admin-panel-prep"
            : "admin-inline-form-prep",
        className,
      )}
    >
      {children}
    </div>
  );
}
