"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  variant?: "light" | "dark";
  /** Solo ícono, para barras compactas en mobile */
  compact?: boolean;
};

export function SignOutButton({
  variant = "light",
  compact = false,
}: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      aria-label="Cerrar sesión"
      className={cn(
        "flex cursor-pointer items-center rounded-lg text-sm transition-colors",
        compact ? "gap-0 p-2" : "w-full gap-3 px-3 py-2.5",
        variant === "dark"
          ? "text-neutral-400 hover:bg-white/5 hover:text-white"
          : "text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200",
      )}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {compact ? null : <span>Cerrar sesión</span>}
    </button>
  );
}
