"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  variant?: "light" | "dark";
};

export function SignOutButton({ variant = "light" }: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        variant === "dark"
          ? "text-neutral-400 hover:bg-white/5 hover:text-white"
          : "text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200",
      )}
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </button>
  );
}
