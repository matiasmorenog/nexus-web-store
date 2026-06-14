import type { ComponentPropsWithoutRef, FormHTMLAttributes, ReactNode } from "react";
import { STORE_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export const adminSelectClass =
  "flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1";

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
        "flex justify-end gap-2 border-t border-neutral-100 pt-4",
        sticky &&
          "ml-auto w-fit border-t-0 py-2 pl-3 pr-6 md:static md:border-t md:py-0 md:pl-0 md:pr-0",
        sticky && "sticky right-0 z-10 -mr-6 md:mr-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

type AdminCategorySelectProps = ComponentPropsWithoutRef<"select">;

export function AdminCategorySelect({
  className,
  ...props
}: AdminCategorySelectProps) {
  return (
    <select className={cn(adminSelectClass, className)} {...props}>
      {STORE_CATEGORIES.map((category) => (
        <option key={category.slug} value={category.slug}>
          {category.label}
        </option>
      ))}
    </select>
  );
}

type AdminTextareaProps = ComponentPropsWithoutRef<"textarea">;

export function AdminTextarea({ className, ...props }: AdminTextareaProps) {
  return <textarea className={cn(adminSelectClass, className)} {...props} />;
}
