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
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
          <div>
            {title && <h2 className="font-semibold text-neutral-900">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm text-neutral-500">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={cn(padding && "p-6")}>{children}</div>
    </div>
  );
}
