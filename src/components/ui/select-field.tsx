import type { ComponentPropsWithoutRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared native select surface: hides OS arrow, reserves room for custom chevron. */
export const selectFieldClass =
  "block h-10 w-full appearance-none rounded-md border border-neutral-300 bg-white py-2 pl-3 pr-10 text-sm text-neutral-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500";

type SelectFieldProps = ComponentPropsWithoutRef<"select"> & {
  wrapperClassName?: string;
};

export function SelectField({
  className,
  wrapperClassName,
  disabled,
  ...props
}: SelectFieldProps) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <select
        className={cn(selectFieldClass, className)}
        disabled={disabled}
        {...props}
      />
      <ChevronDown
        className={cn(
          "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-600",
          disabled && "text-neutral-400",
        )}
        aria-hidden
      />
    </div>
  );
}
