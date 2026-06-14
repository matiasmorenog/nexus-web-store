import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const adminTableClass = "w-full text-sm";
export const adminTableHeadClass = "border-b border-neutral-100 bg-neutral-50/80";
export const adminTableThClass =
  "px-6 py-3 text-left font-medium text-neutral-600";
export const adminTableBodyClass = "divide-y divide-neutral-100";
export const adminTableRowClass = "hover:bg-neutral-50/50";
export const adminTableTdClass = "px-6 py-3";

export type AdminTableColumn =
  | string
  | {
      label: string;
      align?: "left" | "right";
      className?: string;
    };

function normalizeColumn(column: AdminTableColumn) {
  if (typeof column === "string") {
    return { label: column, align: "left" as const, className: undefined };
  }

  return {
    label: column.label,
    align: column.align ?? "left",
    className: column.className,
  };
}

export function AdminTableScroll({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={cn("admin-table-scroll", className)}>
      {children}
    </div>
  );
}

type AdminDataTableProps = {
  columns: AdminTableColumn[];
  children: ReactNode;
  id?: string;
  scrollClassName?: string;
  tableClassName?: string;
};

export function AdminDataTable({
  columns,
  children,
  id,
  scrollClassName,
  tableClassName,
}: AdminDataTableProps) {
  return (
    <AdminTableScroll id={id} className={scrollClassName}>
      <table className={cn(adminTableClass, tableClassName)}>
        <thead className={adminTableHeadClass}>
          <tr>
            {columns.map((column) => {
              const { label, align, className } = normalizeColumn(column);

              return (
                <th
                  key={label}
                  className={cn(
                    adminTableThClass,
                    align === "right" && "text-right",
                    className,
                  )}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={adminTableBodyClass}>{children}</tbody>
      </table>
    </AdminTableScroll>
  );
}

export const AdminTableRow = forwardRef<
  HTMLTableRowElement,
  ComponentPropsWithoutRef<"tr">
>(function AdminTableRow({ className, ...props }, ref) {
  return (
    <tr ref={ref} className={cn(adminTableRowClass, className)} {...props} />
  );
});

type AdminTableCellProps = ComponentPropsWithoutRef<"td"> & {
  align?: "left" | "right";
};

export function AdminTableCell({
  className,
  align = "left",
  ...props
}: AdminTableCellProps) {
  return (
    <td
      className={cn(
        adminTableTdClass,
        align === "right" && "text-right",
        className,
      )}
      {...props}
    />
  );
}

export function AdminTableEmpty({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <AdminTableRow className="hover:bg-transparent">
      <AdminTableCell
        colSpan={colSpan}
        className="py-12 text-center text-neutral-500"
      >
        {children}
      </AdminTableCell>
    </AdminTableRow>
  );
}

export function AdminTableActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex gap-2", className)}>{children}</div>;
}

const iconLinkClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--brand-primary)] bg-transparent text-[var(--brand-primary)] transition-colors hover:bg-[var(--brand-primary-soft)] active:brightness-95 disabled:pointer-events-none disabled:opacity-50";

type AdminTableIconActionProps = {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
};

export function AdminTableIconAction({
  label,
  icon: Icon,
  href,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
}: AdminTableIconActionProps) {
  const icon = loading ? (
    <Loader2 className="size-4 animate-spin" aria-hidden />
  ) : (
    <Icon className="size-4" aria-hidden />
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          iconLinkClass,
          (disabled || loading) && "pointer-events-none opacity-50",
        )}
        aria-label={label}
        aria-disabled={disabled || loading}
      >
        {icon}
      </Link>
    );
  }

  return (
    <Button
      type={type}
      variant="secondary"
      size="sm"
      className="size-8 shrink-0 p-0"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={label}
    >
      {icon}
    </Button>
  );
}
