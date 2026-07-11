"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { SignOutButton } from "@/components/admin/sign-out-button";
import {
  isModuleNavItemEnabled,
  type AdminNavItem,
  type ModuleId,
} from "@/lib/modules";
import { moduleUpgradeHref } from "@/lib/modules/access";
import { cn } from "@/lib/utils";

type AdminNavProps = {
  brandPrefix: string;
  userName?: string | null;
  userEmail?: string | null;
  enabledModuleIds: ModuleId[];
  navItems: AdminNavItem[];
};

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemHref(
  item: AdminNavItem,
  enabledModuleIds: ModuleId[],
) {
  if (item.kind === "module" && !isModuleNavItemEnabled(item, enabledModuleIds)) {
    return moduleUpgradeHref(item.moduleId);
  }
  return item.href;
}

function DesktopNavLink({
  item,
  enabledModuleIds,
  pathname,
}: {
  item: AdminNavItem;
  enabledModuleIds: ModuleId[];
  pathname: string;
}) {
  const active = isActive(pathname, item.href, item.exact);

  return (
    <Link
      href={navItemHref(item, enabledModuleIds)}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-white/10 text-white"
          : "text-neutral-400 hover:bg-white/5 hover:text-white",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate">{item.label}</span>
        {item.kind === "plan" ? (
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
            Plus
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function AdminNav({
  brandPrefix,
  userName,
  userEmail,
  enabledModuleIds,
  navItems,
}: AdminNavProps) {
  const pathname = usePathname();
  const coreItems = navItems.filter((item) => item.kind === "core");
  const moduleItems = navItems.filter((item) => item.kind === "module");
  const planItem = navItems.find((item) => item.kind === "plan");

  const linkClass = (item: AdminNavItem, mobile = false) => {
    const active = isActive(pathname, item.href, item.exact);

    return cn(
      "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
      mobile ? "px-3 py-2.5" : "px-3 py-2.5",
      active
        ? mobile
          ? "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
          : "bg-white/10 text-white"
        : mobile
          ? "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          : "text-neutral-400 hover:bg-white/5 hover:text-white",
    );
  };

  return (
    <>
      <aside className="relative hidden min-h-0 w-64 shrink-0 flex-col overflow-hidden bg-zinc-900 lg:flex lg:h-full">
        <div className="h-1 w-full shrink-0 bg-[var(--brand-primary)]" />
        <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-6">
          <Link href="/admin" className="text-lg font-bold text-white">
            {brandPrefix}{" "}
            <span className="font-normal text-[var(--brand-primary)]">Admin</span>
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <nav
            aria-label="Navegación principal"
            className="shrink-0 space-y-1 border-b border-white/10 p-4"
          >
            {coreItems.map((item) => (
              <DesktopNavLink
                key={item.href}
                item={item}
                enabledModuleIds={enabledModuleIds}
                pathname={pathname}
              />
            ))}
          </nav>

          {moduleItems.length > 0 ? (
            <nav
              aria-label="Módulos Plus"
              className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-y-contain p-4 [-ms-overflow-style:none] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20"
            >
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Módulos
              </p>
              {moduleItems.map((item) => (
                <DesktopNavLink
                  key={item.href}
                  item={item}
                  enabledModuleIds={enabledModuleIds}
                  pathname={pathname}
                />
              ))}
            </nav>
          ) : null}

          {planItem ? (
            <nav
              aria-label="Plan"
              className="shrink-0 space-y-1 border-t border-white/10 p-4"
            >
              <DesktopNavLink
                item={planItem}
                enabledModuleIds={enabledModuleIds}
                pathname={pathname}
              />
            </nav>
          ) : null}
        </div>

        <div className="shrink-0 space-y-3 border-t border-white/10 p-4">
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
              href={navItemHref(item, enabledModuleIds)}
              aria-label={item.label}
              className={cn(
                linkClass(item, true),
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
