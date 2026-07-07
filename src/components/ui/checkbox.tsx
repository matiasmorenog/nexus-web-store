import { Check } from "lucide-react";
import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Checkbox = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "peer size-4 shrink-0 cursor-pointer appearance-none rounded border border-neutral-300 bg-white shadow-sm transition-[border-color,background-color,box-shadow,transform]",
        "checked:border-[var(--brand-primary)] checked:bg-[var(--brand-primary)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1",
        "enabled:hover:border-neutral-400 enabled:checked:hover:brightness-95",
        "enabled:active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
    <Check
      className="pointer-events-none absolute size-3 text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100 peer-disabled:opacity-0"
      strokeWidth={3}
      aria-hidden
    />
  </span>
));

Checkbox.displayName = "Checkbox";
