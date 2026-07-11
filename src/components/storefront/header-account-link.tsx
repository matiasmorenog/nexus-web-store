"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";
import { buildCustomerLoginHref } from "@/lib/customer-auth-redirect";
import { cn } from "@/lib/utils";
import { app2ButtonClassName } from "@/themes/app2/components/app2-button";

const app2LinkClass = app2ButtonClassName({
  variant: "secondary",
  size: "md",
  className: "h-10 px-3",
});

const lightLinkClass =
  "inline-flex h-10 cursor-pointer items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] border border-neutral-300 bg-white px-3 text-neutral-900 transition-colors hover:border-neutral-400 hover:bg-neutral-50";

const darkLinkClass =
  "inline-flex h-10 cursor-pointer items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] border border-white/15 bg-white/5 px-3 text-neutral-100 transition-colors hover:border-white/25 hover:bg-white/10";

export function HeaderAccountLink({
  chrome = "light",
  uiVariant = "app1",
}: {
  chrome?: "light" | "dark";
  uiVariant?: "app1" | "app2";
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center"
        aria-hidden
      />
    );
  }

  const href =
    session?.user?.role === "CUSTOMER"
      ? "/cuenta/pedidos"
      : buildCustomerLoginHref(pathname);

  const label =
    session?.user?.role === "CUSTOMER" ? "Mi cuenta" : "Ingresar";

  return (
    <Link
      href={href}
      className={cn(
        uiVariant === "app2"
          ? app2LinkClass
          : chrome === "dark"
            ? darkLinkClass
            : lightLinkClass,
      )}
      aria-label={label}
    >
      <User className="h-5 w-5" />
    </Link>
  );
}
