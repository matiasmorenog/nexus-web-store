"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function CustomerSignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Cerrar sesión
    </Button>
  );
}
