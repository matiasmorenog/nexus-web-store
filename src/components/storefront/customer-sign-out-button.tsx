"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CustomerSignOutButtonProps = {
  iconOnly?: boolean;
  className?: string;
};

export function CustomerSignOutButton({
  iconOnly = false,
  className,
}: CustomerSignOutButtonProps) {
  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        aria-label="Cerrar sesión"
        className={cn(
          "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50",
          className,
        )}
      >
        <LogOut className="h-5 w-5" />
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Cerrar sesión
    </Button>
  );
}
