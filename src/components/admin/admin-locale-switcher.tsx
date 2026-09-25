"use client";

import { useRouter } from "next/navigation";
import { adminChrome, type AdminLocale } from "@/lib/admin-locale";

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
      ? "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
      : tone === "dark"
        ? "rounded-md px-2 py-1 text-xs text-neutral-300 hover:bg-white/10 hover:text-white"
        : "rounded-md px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100";
  const activeClass =
    appearance === "segmented"
      ? "bg-white text-neutral-900 shadow-sm"
      : tone === "dark"
        ? "bg-white/15 text-white"
        : "bg-neutral-200 text-neutral-900";
  const idleClass =
    appearance === "segmented" ? "text-neutral-500 hover:text-neutral-800" : "";

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
            ? "flex gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1"
            : "flex gap-1"
        }
        role="group"
        aria-label={copy.language}
      >
        <button
          type="button"
          className={`${buttonClass} ${locale === "es" ? activeClass : idleClass}`}
          aria-pressed={locale === "es"}
          onClick={() => choose("es")}
        >
          {copy.spanish}
        </button>
        <button
          type="button"
          className={`${buttonClass} ${locale === "it" ? activeClass : idleClass}`}
          aria-pressed={locale === "it"}
          onClick={() => choose("it")}
        >
          {copy.italian}
        </button>
      </div>
    </div>
  );
}
