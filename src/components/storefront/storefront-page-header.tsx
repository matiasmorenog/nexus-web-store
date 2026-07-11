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
  /** Compact header for nested account pages inside the account shell */
  variant?: "default" | "account";
};

export function StorefrontPageHeader({
  title,
  description,
  backHref,
  backLabel = "Volver",
  className,
  action,
  variant = "default",
}: StorefrontPageHeaderProps) {
  const isAccount = variant === "account";

  return (
    <div className={cn(isAccount ? "mb-6" : "mb-8", className)}>
      {backHref ? (
        <Link
          href={backHref}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-[var(--brand-primary)]",
            isAccount ? "mb-3" : "mb-4",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className={cn(
              "font-bold tracking-tight text-neutral-900",
              isAccount ? "text-xl sm:text-2xl" : "text-3xl",
            )}
          >
            <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-0.5">
              {title}
            </span>
          </h1>
          {description ? (
            <p
              className={cn(
                "mt-1.5 max-w-2xl text-sm text-neutral-500",
                !isAccount && "sm:text-base",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
