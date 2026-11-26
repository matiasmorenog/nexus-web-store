"use client";

import { useRouter } from "next/navigation";
import { adminChrome, type AdminLocale } from "@/lib/admin-locale";
import { cn } from "@/lib/utils";

type AdminLocaleSwitcherProps = {
  locale: AdminLocale;
  tone?: "dark" | "light";
  showLabel?: boolean;
  className?: string;
  appearance?: "compact" | "segmented";
};

export function AdminLocaleSwitcher({
  locale,
  tone = "dark",
  showLabel = true,
  className = "px-3",
  appearance = "compact",
}: AdminLocaleSwitcherProps) {
  const router = useRouter();
  const copy = adminChrome[locale];

  const choose = (next: AdminLocale) => {
    if (next === locale) return;
    document.cookie = `admin_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  };

  const buttonClass =
    appearance === "segmented"
      ? "flex-1 select-none rounded-md px-3 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1"
      : tone === "dark"
        ? "select-none rounded-md px-2 py-1 text-xs text-neutral-300 hover:bg-white/10 hover:text-white"
        : "select-none rounded-md px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100";
  const activeClass =
    appearance === "segmented"
      ? "cursor-pointer bg-white font-semibold text-[var(--brand-primary)] shadow-sm ring-1 ring-neutral-200/80"
      : tone === "dark"
        ? "bg-white/15 text-white"
        : "bg-neutral-200 text-neutral-900";
  const idleClass =
    appearance === "segmented"
      ? "cursor-pointer font-medium text-neutral-600 hover:bg-white/60 hover:text-neutral-900"
      : "";

  return (
    <div className={className}>
      {showLabel ? (
        <p className={tone === "dark" ? "mb-1 text-[10px] uppercase tracking-wide text-neutral-500" : "mb-1 text-[10px] uppercase tracking-wide text-neutral-400"}>
          {copy.language}
        </p>
      ) : null}
      <div
        className={
          appearance === "segmented"
            ? "flex gap-1 rounded-lg border border-neutral-300 bg-neutral-100 p-1"
            : "flex gap-1"
        }
        role="group"
        aria-label={copy.language}
      >
        <button
          type="button"
          className={cn(buttonClass, locale === "es" ? activeClass : idleClass)}
          aria-pressed={locale === "es"}
          onClick={() => choose("es")}
        >
          Español
        </button>
        <button
          type="button"
          className={cn(buttonClass, locale === "it" ? activeClass : idleClass)}
          aria-pressed={locale === "it"}
          onClick={() => choose("it")}
        >
          Italiano
        </button>
      </div>
    </div>
  );
}
