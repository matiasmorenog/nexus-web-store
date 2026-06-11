import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "brand" | "blue" | "green" | "amber";
};

const accentStyles = {
  brand: "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
};

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
}: AdminStatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            accentStyles[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
