import { cn } from "@/lib/utils";

type AdminCardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  padding?: boolean;
};

export function AdminCard({
  children,
  className,
  title,
  description,
  action,
  padding = true,
}: AdminCardProps) {
  const hasHeader = Boolean(title || description || action);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm",
        className,
      )}
    >
      {hasHeader && (
        <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
          {(title || action) && (
            <div className="flex items-center justify-between gap-4">
              {title ? (
                <h2 className="min-w-0 font-semibold text-neutral-900">{title}</h2>
              ) : (
                <span />
              )}
              {action ? <div className="shrink-0">{action}</div> : null}
            </div>
          )}
          {description ? (
            <p className={cn("text-sm text-neutral-500", title && "mt-1")}>
              {description}
            </p>
          ) : null}
        </div>
      )}
      <div className={cn(padding && "p-6")}>{children}</div>
    </div>
  );
}
