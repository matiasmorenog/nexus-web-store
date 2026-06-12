"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    shortLabel: "Inicio",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/admin/productos", label: "Productos", shortLabel: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", shortLabel: "Pedidos", icon: ShoppingCart },
  {
    href: "/admin/configuracion",
    label: "Configuración",
    shortLabel: "Config",
    icon: Settings,
  },
];

type AdminNavProps = {
  brandPrefix: string;
  userName?: string | null;
  userEmail?: string | null;
};

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ brandPrefix, userName, userEmail }: AdminNavProps) {
  const pathname = usePathname();

  const linkClass = (href: string, exact?: boolean, mobile = false) =>
    cn(
      "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
      mobile ? "px-3 py-2.5" : "px-3 py-2.5",
      isActive(pathname, href, exact)
        ? mobile
          ? "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
          : "bg-white/10 text-white"
        : mobile
          ? "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          : "text-neutral-400 hover:bg-white/5 hover:text-white",
    );

  return (
    <>
      <aside className="relative hidden h-screen w-64 shrink-0 flex-col bg-zinc-900 lg:flex">
        <div className="h-1 w-full bg-[var(--brand-primary)]" />
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/admin" className="text-lg font-bold text-white">
            {brandPrefix}{" "}
            <span className="font-normal text-[var(--brand-primary)]">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(item.href, item.exact)}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-white/10 p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            Ver tienda
          </Link>
          {(userName || userEmail) && (
            <div className="rounded-lg bg-white/5 px-3 py-2.5">
              {userName && (
                <p className="truncate text-sm font-medium text-white">
                  {userName}
                </p>
              )}
              {userEmail && (
                <p className="truncate text-xs text-neutral-500">{userEmail}</p>
              )}
            </div>
          )}
          <SignOutButton variant="dark" />
        </div>
      </aside>

      <header className="shrink-0 border-b border-neutral-200 bg-white lg:hidden">
        <div className="h-0.5 w-full bg-[var(--brand-primary)]" />
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Link href="/admin" className="min-w-0 truncate font-bold text-neutral-900">
            {brandPrefix}{" "}
            <span className="text-[var(--brand-primary)]">Admin</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="rounded-lg px-2 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[var(--brand-primary)]"
            >
              Tienda
            </Link>
            <SignOutButton variant="light" compact />
          </div>
        </div>
        <nav
          aria-label="Secciones del admin"
          className="grid grid-cols-4 gap-1 px-2 pb-3 sm:flex sm:gap-1.5 sm:overflow-x-auto sm:px-4 sm:scroll-px-4 sm:overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                linkClass(item.href, item.exact, true),
                "flex-col justify-center gap-1 px-1 py-2.5 text-center text-[11px] leading-tight sm:flex-row sm:justify-start sm:gap-3 sm:px-3 sm:py-2.5 sm:text-left sm:text-sm",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate sm:hidden">{item.shortLabel}</span>
              <span className="hidden truncate sm:inline">{item.label}</span>
            </Link>
          ))}
          <div className="hidden w-2 shrink-0 sm:block" aria-hidden />
        </nav>
      </header>
    </>
  );
}
