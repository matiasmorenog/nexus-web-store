import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  /** When set with `titleCurrent`, title becomes CRM › Cliente in the same header. */
  titleHref?: string;
  titleCurrent?: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  titleHref,
  titleCurrent,
  description,
  action,
  className,
}: AdminPageHeaderProps) {
  const hasTrail = Boolean(titleHref && titleCurrent);

  return (
    <div className={cn("mb-8 select-none", className)}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 text-2xl font-bold tracking-tight text-neutral-900">
          <span className="inline-flex max-w-full flex-wrap items-center gap-1.5 border-b-2 border-[var(--brand-primary)] pb-0.5">
            {hasTrail ? (
              <>
                <Link
                  href={titleHref!}
                  className="text-neutral-500 transition-colors hover:text-[var(--brand-primary)]"
                >
                  {title}
                </Link>
                <ChevronRight
                  className="size-5 shrink-0 text-neutral-300"
                  aria-hidden
                />
                <span className="truncate text-neutral-900">{titleCurrent}</span>
              </>
            ) : (
              <span>{title}</span>
            )}
          </span>
        </h1>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? (
        <p className="mt-2 max-w-3xl text-pretty text-sm text-neutral-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}
