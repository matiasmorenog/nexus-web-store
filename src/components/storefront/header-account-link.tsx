"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

const linkClass =
  "inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-[var(--ui-button-radius,0.5rem)] border border-neutral-300 bg-white px-2.5 text-sm font-[var(--ui-button-font-weight,500)] text-neutral-900 transition-colors hover:border-neutral-400 hover:bg-neutral-50 sm:px-3";

export function HeaderAccountLink() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span
        className="inline-flex h-8 w-10 shrink-0 items-center justify-center"
        aria-hidden
      />
    );
  }

  const href =
    session?.user?.role === "CUSTOMER" ? "/cuenta/pedidos" : "/cuenta/ingresar";

  const label =
    session?.user?.role === "CUSTOMER" ? "Mi cuenta" : "Ingresar";

  return (
    <Link href={href} className={cn(linkClass)} aria-label={label}>
      <User className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
