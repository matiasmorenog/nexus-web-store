import type { ComponentPropsWithoutRef, FormHTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { STORE_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export const adminSelectClass =
  "block h-10 w-full appearance-none rounded-md border border-neutral-300 bg-white py-2 pl-3 pr-10 text-sm text-neutral-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500";

type AdminFormProps = FormHTMLAttributes<HTMLFormElement>;

export function AdminForm({ className, ...props }: AdminFormProps) {
  return <form className={cn("space-y-4", className)} {...props} />;
}

type AdminFormGridProps = {
  children: ReactNode;
  columns?: 2 | 4;
  className?: string;
};

export function AdminFormGrid({
  children,
  columns = 2,
  className,
}: AdminFormGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "sm:grid-cols-2",
        columns === 4 && "grid-cols-2 sm:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminFormAlert({
  variant,
  children,
}: {
  variant: "error" | "success";
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "rounded-md px-3 py-2 text-sm",
        variant === "error" && "bg-red-50 text-red-700",
        variant === "success" && "bg-green-50 text-green-700",
      )}
    >
      {children}
    </p>
  );
}

type AdminFormActionsProps = {
  children: ReactNode;
  sticky?: boolean;
  className?: string;
};

export function AdminFormActions({
  children,
  sticky = false,
  className,
}: AdminFormActionsProps) {
  return (
    <div
      className={cn(
        "flex justify-end gap-2",
        sticky
          ? "sticky right-0 z-10 -mr-6 ml-auto w-fit py-2 pl-3 pr-6 md:static md:mr-0 md:py-0 md:pl-0 md:pr-0"
          : "border-t border-neutral-100 pt-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

type AdminSelectProps = ComponentPropsWithoutRef<"select"> & {
  wrapperClassName?: string;
};

export function AdminSelect({
  className,
  wrapperClassName,
  disabled,
  ...props
}: AdminSelectProps) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <select
        className={cn(adminSelectClass, className)}
        disabled={disabled}
        {...props}
      />
      <ChevronDown
        className={cn(
          "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-500",
          disabled && "text-neutral-400",
        )}
        aria-hidden
      />
    </div>
  );
}

type AdminCategorySelectProps = ComponentPropsWithoutRef<"select">;

export function AdminCategorySelect({
  className,
  ...props
}: AdminCategorySelectProps) {
  return (
    <AdminSelect className={className} {...props}>
      {STORE_CATEGORIES.map((category) => (
        <option key={category.slug} value={category.slug}>
          {category.label}
        </option>
      ))}
    </AdminSelect>
  );
}

type AdminTextareaProps = ComponentPropsWithoutRef<"textarea">;

export function AdminTextarea({ className, ...props }: AdminTextareaProps) {
  return <textarea className={cn(adminSelectClass, className)} {...props} />;
}
