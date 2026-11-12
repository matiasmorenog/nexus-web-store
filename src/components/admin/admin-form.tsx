import type { ComponentPropsWithoutRef, FormHTMLAttributes, ReactNode } from "react";
import { selectFieldClass } from "@/components/ui/select-field";
import { MenuSelect } from "@/components/ui/menu-select";
import { STORE_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

/** Shared field surface (textarea). Dropdowns: use `MenuSelect`. */
export const adminSelectClass = selectFieldClass;

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

/** @deprecated Prefer `MenuSelect` — kept only for rare native-select callers. */
export { SelectField as AdminSelect } from "@/components/ui/select-field";

type AdminCategorySelectProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function AdminCategorySelect({
  className,
  "aria-label": ariaLabel = "Categoría",
  ...props
}: AdminCategorySelectProps) {
  return (
    <MenuSelect
      className={className}
      aria-label={ariaLabel}
      options={STORE_CATEGORIES.map((category) => ({
        value: category.slug,
        label: category.label,
      }))}
      {...props}
    />
  );
}

type AdminTextareaProps = ComponentPropsWithoutRef<"textarea">;

export function AdminTextarea({ className, ...props }: AdminTextareaProps) {
  return <textarea className={cn(adminSelectClass, className)} {...props} />;
}
