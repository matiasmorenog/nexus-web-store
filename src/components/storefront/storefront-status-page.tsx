import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StorefrontStatusPageProps = {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  children: React.ReactNode;
  actionHref: string;
  actionLabel: string;
  actionVariant?: "primary" | "secondary" | "outline";
};

export function StorefrontStatusPage({
  icon: Icon,
  iconClassName,
  title,
  children,
  actionHref,
  actionLabel,
  actionVariant = "primary",
}: StorefrontStatusPageProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="rounded-xl border border-neutral-200/80 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-primary-soft)]">
          <Icon className={cn("h-8 w-8", iconClassName ?? "text-[var(--brand-primary)]")} />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900">
          {title}
        </h1>
        <div className="mt-3 space-y-2 text-sm text-neutral-600 sm:text-base">
          {children}
        </div>
        <Link href={actionHref} className="mt-8 inline-block">
          <Button variant={actionVariant} size="lg">
            {actionLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
