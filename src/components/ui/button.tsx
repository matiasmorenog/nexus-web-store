import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[var(--brand-primary)] text-white hover:opacity-90": variant === "primary",
            "bg-neutral-100 text-neutral-900 hover:bg-neutral-200": variant === "secondary",
            "border border-neutral-300 bg-white hover:bg-neutral-50": variant === "outline",
            "hover:bg-neutral-100": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
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
