import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[var(--brand-primary)] text-white hover:brightness-95 active:brightness-90":
              variant === "primary",
            "rounded-lg border border-[var(--brand-primary)] bg-transparent text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] active:brightness-95":
              variant === "secondary",
            "border border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50 active:bg-neutral-100":
              variant === "outline",
            "bg-red-600 text-white hover:bg-red-700 active:bg-red-800": variant === "danger",
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
