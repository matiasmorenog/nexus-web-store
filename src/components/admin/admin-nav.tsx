"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardList,
  CreditCard,
  ExternalLink,
  Gift,
  Heart,
  Home,
  Languages,
  LayoutTemplate,
  Lock,
  Megaphone,
  Menu,
  Package,
  QrCode,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Tags,
  Truck,
  Users,
  Webhook,
  X,
} from "lucide-react";
import { SignOutButton } from "@/components/admin/sign-out-button";
import {
  SlidingIndicatorPill,
  useSlidingIndicator,
} from "@/components/ui/sliding-indicator";
import { useShellNavEnterOnce } from "@/hooks/use-shell-nav-enter-once";
import { adminChrome, type AdminLocale } from "@/lib/admin-locale";
import {
  isAdminNavItemActive,
  isConfigSubmenuPathActive,
  isModuleNavItemEnabled,
  type AdminNavIconKey,
  type AdminNavItem,
  type AdminNavModel,
  type ModuleId,
} from "@/lib/modules";
import { moduleUpgradeHref } from "@/lib/modules/access";
import { cn } from "@/lib/utils";

const ADMIN_NAV_ICONS: Record<AdminNavIconKey, LucideIcon> = {
  dashboard: LayoutTemplate,
  products: Package,
  categories: Tags,
  orders: ShoppingCart,
  config: Settings,
  language: Languages,
  security: Lock,
  qr: QrCode,
  plan: Sparkles,
  coupons: Gift,
  homeEditor: Home,
  analytics: BarChart3,
  reportes: ClipboardList,
  cobros: CreditCard,
  crm: Users,
  shippingCarriers: Truck,
  marketing: Megaphone,
  multiUser: Users,
  api: Webhook,
  seo: Search,
  wishlist: Heart,
};

type AdminNavProps = {
  brandPrefix: string;
  userName?: string | null;
  userEmail?: string | null;
  enabledModuleIds: ModuleId[];
  navModel: AdminNavModel;
  locale?: AdminLocale;
};

function AdminNavIcon({
  iconKey,
  className,
}: {
  iconKey: AdminNavIconKey;
  className?: string;
}) {
  const Icon = ADMIN_NAV_ICONS[iconKey];
  return <Icon className={className} />;
}

function navItemHref(item: AdminNavItem, enabledModuleIds: ModuleId[]) {
  if (item.kind === "module" && !isModuleNavItemEnabled(item, enabledModuleIds)) {
    return moduleUpgradeHref(item.moduleId);
  }
  return item.href;
}

function DesktopNavLink({
  item,
  enabledModuleIds,
  pathname,
  onNavigate,
  nested = false,
  id,
  className,
  subIndex,
  configLast = false,
}: {
  item: AdminNavItem;
  enabledModuleIds: ModuleId[];
  pathname: string;
  onNavigate?: () => void;
  nested?: boolean;
  id?: string;
  className?: string;
  /** When set, plays fast submenu cascade (after shell settled). */
  subIndex?: number;
  /** Marks last Config child for scroll-into-view measurement. */
  configLast?: boolean;
}) {
  const active = isAdminNavItemActive(pathname, item);
  const isPlan = item.kind === "plan";

  return (
    <Link
      id={id}
      href={navItemHref(item, enabledModuleIds)}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      data-sub-i={subIndex != null ? String(subIndex) : undefined}
      data-config-last={configLast ? "true" : undefined}
      className={cn(
        "relative z-[1] flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors duration-200",
        nested ? "px-3 pl-9" : "px-3",
        isPlan
          ? cn(
              "font-semibold text-[var(--brand-primary)]",
              active
                ? "bg-[var(--brand-primary)]/15"
                : "hover:bg-[var(--brand-primary)]/10",
            )
          : active
            ? "text-white"
            : "text-neutral-400 hover:bg-white/5 hover:text-white",
        subIndex != null && "shell-nav-submenu-enter",
        className,
      )}
    >
      <AdminNavIcon iconKey={item.iconKey} className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function navScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "smooth";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

function measureConfigSubmenuHeight(nav: HTMLElement): number {
  const first = nav.querySelector<HTMLElement>("#admin-config-submenu");
  const last = nav.querySelector<HTMLElement>("[data-config-last='true']");
  if (!first || !last) return 0;
  const gap = 4; // matches nav `gap-1`
  return Math.max(
    0,
    last.getBoundingClientRect().bottom - first.getBoundingClientRect().top + gap,
  );
}

function ConfigNavGroup({
  hub,
  items,
  enabledModuleIds,
  pathname,
  locale,
  onNavigate,
  shellSettled,
  navScrollRef,
}: {
  hub: AdminNavItem;
  items: AdminNavItem[];
  enabledModuleIds: ModuleId[];
  pathname: string;
  locale: AdminLocale;
  onNavigate?: () => void;
  /** After page-load cascade: submenu uses short local stagger. */
  shellSettled: boolean;
  navScrollRef: RefObject<HTMLElement | null>;
}) {
  const copy = adminChrome[locale];
  const pathInGroup = isConfigSubmenuPathActive(pathname, {
    configHub: hub as AdminNavModel["configHub"],
    configChildren: items,
  });
  const [manualOpen, setManualOpen] = useState(false);
  const open = pathInGroup || manualOpen;
  const [scrollOpenPending, setScrollOpenPending] = useState(false);
  const closingRef = useRef(false);
  /**
   * Open during page-load cascade → keep main nth-child delays (no re-anim after settle).
   * State (not ref) so render can read it under react-hooks/refs.
   */
  const [openedBeforeSettle, setOpenedBeforeSettle] = useState(false);

  useLayoutEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- sync open-vs-settle flag before paint */
    if (!shellSettled && open) {
      setOpenedBeforeSettle(true);
    }
    if (!open) {
      setOpenedBeforeSettle(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [shellSettled, open]);

  useEffect(() => {
    if (!scrollOpenPending || !open) return;
    const nav = navScrollRef.current;
    if (!nav) {
      setScrollOpenPending(false);
      return;
    }

    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (cancelled) return;
        nav.scrollTo({ top: nav.scrollHeight, behavior: navScrollBehavior() });
        setScrollOpenPending(false);
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [scrollOpenPending, open, navScrollRef]);

  // Fast local stagger after shell settled (click expand / navigate into Config).
  const useSubmenuEnter = shellSettled && open && !openedBeforeSettle;

  if (items.length === 0) return null;

  function collapseManual() {
    closingRef.current = false;
    setManualOpen(false);
  }

  function onConfigToggle() {
    if (pathInGroup || closingRef.current) return;

    if (open) {
      const nav = navScrollRef.current;
      if (!nav) {
        setManualOpen(false);
        return;
      }

      const submenuHeight = measureConfigSubmenuHeight(nav);
      const nextMax = Math.max(0, nav.scrollHeight - submenuHeight - nav.clientHeight);

      if (nav.scrollTop <= nextMax + 2) {
        setManualOpen(false);
        return;
      }

      closingRef.current = true;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        nav.removeEventListener("scrollend", onScrollEnd);
        window.clearTimeout(fallback);
        collapseManual();
      };
      const onScrollEnd = () => finish();
      nav.addEventListener("scrollend", onScrollEnd);
      const fallback = window.setTimeout(finish, 400);
      nav.scrollTo({ top: nextMax, behavior: navScrollBehavior() });
      return;
    }

    setManualOpen(true);
    setScrollOpenPending(true);
  }

  // Fragment: keep Config button + children as direct nav kids so cascade nth-child works.
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? "admin-config-submenu" : undefined}
        aria-label={open ? copy.collapseConfig : copy.expandConfig}
        onClick={onConfigToggle}
        className={cn(
          "relative z-[1] flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200",
          pathInGroup
            ? "text-white"
            : "text-neutral-400 hover:bg-white/5 hover:text-white",
        )}
      >
        <AdminNavIcon iconKey={hub.iconKey} className="h-4 w-4 shrink-0" />
        <span className="truncate">{hub.label}</span>
      </button>
      {open
        ? items.map((item, index) => (
            <DesktopNavLink
              key={item.href}
              id={index === 0 ? "admin-config-submenu" : undefined}
              item={item}
              enabledModuleIds={enabledModuleIds}
              pathname={pathname}
              onNavigate={onNavigate}
              nested
              subIndex={useSubmenuEnter ? index : undefined}
              configLast={index === items.length - 1}
            />
          ))
        : null}
    </>
  );
}

type AdminSidebarPanelProps = {
  brandPrefix: string;
  userName?: string | null;
  userEmail?: string | null;
  enabledModuleIds: ModuleId[];
  navModel: AdminNavModel;
  pathname: string;
  locale: AdminLocale;
  onNavigate?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
  /** Desktop shell: cascade on page load. Mobile drawer: false. */
  cascadeEnter?: boolean;
};

function AdminSidebarPanel({
  brandPrefix,
  userName,
  userEmail,
  enabledModuleIds,
  navModel,
  pathname,
  locale,
  onNavigate,
  showCloseButton = false,
  onClose,
  cascadeEnter = true,
}: AdminSidebarPanelProps) {
  const copy = adminChrome[locale];
  const {
    animate: staggerEnter,
    pending: staggerPending,
    settled: shellSettled,
  } = useShellNavEnterOnce(cascadeEnter);
  const { listRef, indicator, animate, visible } = useSlidingIndicator(
    pathname,
    { waitForShellEnter: cascadeEnter },
  );

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 sm:px-6">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="min-w-0 truncate text-lg font-bold text-white"
        >
          {brandPrefix}{" "}
          <span className="font-normal text-[var(--brand-primary)]">Admin</span>
        </Link>
        {showCloseButton ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.closeMenu}
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <nav
          ref={listRef}
          aria-label={copy.nav}
          className={cn(
            "relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-y-contain p-4 [-ms-overflow-style:none] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20",
            staggerPending && "shell-nav-pending",
            staggerEnter && "shell-nav-reveal",
          )}
        >
          <SlidingIndicatorPill
            indicator={indicator}
            animate={animate}
            visible={visible}
            skipEnterReveal={cascadeEnter}
            className="rounded-lg bg-white/10"
          />
          {navModel.mainItems.map((item) => (
            <DesktopNavLink
              key={item.href}
              item={item}
              enabledModuleIds={enabledModuleIds}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
          <ConfigNavGroup
            hub={navModel.configHub}
            items={navModel.configChildren}
            enabledModuleIds={enabledModuleIds}
            pathname={pathname}
            locale={locale}
            onNavigate={onNavigate}
            shellSettled={shellSettled}
            navScrollRef={listRef}
          />
        </nav>
      </div>

      <div className="shrink-0 space-y-3 border-t border-white/10 p-4">
        <Link
          href="/"
          target="_blank"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          {copy.viewStore}
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
        <SignOutButton variant="dark" label={copy.signOut} />
      </div>
    </>
  );
}

type AdminMobileNavProps = AdminNavProps & {
  pathname: string;
};

function AdminMobileNav({
  brandPrefix,
  userName,
  userEmail,
  enabledModuleIds,
  navModel,
  pathname,
  locale = "es",
}: AdminMobileNavProps) {
  const copy = adminChrome[locale];
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <>
      <header className="relative z-30 shrink-0 border-b border-neutral-200 bg-white lg:hidden">
        <div className="h-0.5 w-full bg-[var(--brand-primary)]" />
        <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label={copy.openMenu}
            aria-expanded={mobileNavOpen}
            aria-controls="admin-mobile-nav"
            className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href="/admin"
            className="min-w-0 flex-1 truncate font-bold text-neutral-900"
          >
            {brandPrefix}{" "}
            <span className="text-[var(--brand-primary)]">Admin</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="rounded-lg px-2 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[var(--brand-primary)]"
            >
              {copy.store}
            </Link>
            <SignOutButton variant="light" compact label={copy.signOut} />
          </div>
        </div>
      </header>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={copy.closeMenu}
            className="absolute inset-0 bg-black/50"
            onClick={closeMobileNav}
          />
          <aside
            id="admin-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label={copy.menu}
            className="relative flex h-full w-[min(100%,16rem)] flex-col overflow-hidden bg-zinc-900 shadow-xl"
          >
            <div className="h-1 w-full shrink-0 bg-[var(--brand-primary)]" />
            <AdminSidebarPanel
              brandPrefix={brandPrefix}
              userName={userName}
              userEmail={userEmail}
              enabledModuleIds={enabledModuleIds}
              navModel={navModel}
              pathname={pathname}
              locale={locale}
              onNavigate={closeMobileNav}
              showCloseButton
              onClose={closeMobileNav}
              cascadeEnter={false}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}

export function AdminNav({
  brandPrefix,
  userName,
  userEmail,
  enabledModuleIds,
  navModel,
  locale = "es",
}: AdminNavProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="relative hidden min-h-0 w-64 shrink-0 flex-col overflow-hidden bg-zinc-900 lg:flex lg:h-full">
        <div className="h-1 w-full shrink-0 bg-[var(--brand-primary)]" />
        <AdminSidebarPanel
          brandPrefix={brandPrefix}
          userName={userName}
          userEmail={userEmail}
          enabledModuleIds={enabledModuleIds}
          navModel={navModel}
          pathname={pathname}
          locale={locale}
        />
      </aside>

      <AdminMobileNav
        brandPrefix={brandPrefix}
        userName={userName}
        userEmail={userEmail}
        enabledModuleIds={enabledModuleIds}
        navModel={navModel}
        pathname={pathname}
        locale={locale}
      />
    </>
  );
}
