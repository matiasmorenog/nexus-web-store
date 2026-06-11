import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type StorefrontPageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
  action?: React.ReactNode;
};

export function StorefrontPageHeader({
  title,
  description,
  backHref,
  backLabel = "Volver",
  className,
  action,
}: StorefrontPageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {backHref ? (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-0.5">
              {title}
            </span>
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
