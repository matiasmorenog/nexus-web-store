import { cn } from "@/lib/utils";
import { adminCardClass, adminCardHeaderClass } from "@/components/admin/admin-surface";

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
    <div className={cn(adminCardClass, className)}>
      {hasHeader ? (
        <div className={adminCardHeaderClass}>
          {title || action ? (
            <div className="flex items-center justify-between gap-4">
              {title ? (
                <h2 className="min-w-0 font-semibold text-neutral-900">{title}</h2>
              ) : (
                <span />
              )}
              {action ? <div className="shrink-0">{action}</div> : null}
            </div>
          ) : null}
          {description ? (
            <p className={cn("text-sm text-neutral-500", title && "mt-1")}>
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className={cn(padding && "p-4 sm:p-6")}>{children}</div>
    </div>
  );
}
