"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </button>
  );
}
