"use client";

import Link from "next/link";
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { adminSurfaceClass } from "@/components/admin/admin-surface";
import { useCountUp } from "@/components/admin/use-count-up";
import { cn, formatPrice } from "@/lib/utils";

export type AdminStatCardIcon =
  | "package"
  | "shopping-cart"
  | "dollar-sign"
  | "trending-up";

const statIcons: Record<AdminStatCardIcon, LucideIcon> = {
  package: Package,
  "shopping-cart": ShoppingCart,
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
};

type AdminStatCardProps = {
  label: string;
  value: number;
  format?: "number" | "currency";
  icon: AdminStatCardIcon;
  accent?: "brand" | "blue" | "green" | "amber";
  delay?: number;
  href?: string;
};

const accentStyles = {
  brand: "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
};

const accentGlowStyles = {
  brand: "admin-stat-glow-brand",
  blue: "admin-stat-glow-blue",
  green: "admin-stat-glow-green",
  amber: "admin-stat-glow-amber",
};

function formatStatValue(value: number, format: "number" | "currency") {
  return format === "currency"
    ? formatPrice(value)
    : value.toLocaleString("es-AR");
}

export function AdminStatCard({
  label,
  value,
  format = "number",
  icon,
  accent = "brand",
  delay = 0,
  href,
}: AdminStatCardProps) {
  const { displayValue, isComplete } = useCountUp(value, { delay });
  const formattedValue = formatStatValue(displayValue, format);
  const Icon = statIcons[icon];

  const cardClassName = cn(
    adminSurfaceClass,
    "group relative block overflow-hidden p-5 transition-all duration-500",
    "hover:-translate-y-0.5 hover:shadow-md",
    href && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2",
    isComplete && accentGlowStyles[accent],
  );

  const content = (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
        aria-hidden
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p
            className={cn(
              "mt-2 text-2xl font-bold tracking-tight text-neutral-900 tabular-nums",
              !isComplete && "admin-stat-counting",
              isComplete && "admin-stat-landed",
            )}
          >
            {formattedValue}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-500",
            accentStyles[accent],
            isComplete && "admin-stat-icon-landed",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName} aria-label={`Ver ${label.toLowerCase()}`}>
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}
