"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type AdminMotionProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "panel" | "inline";
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
