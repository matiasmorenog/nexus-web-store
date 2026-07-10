import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type App2ButtonVariant = "primary" | "secondary" | "ghost" | "promo" | "tab" | "tab-active";
export type App2ButtonSize = "sm" | "md" | "lg" | "promo";

const baseClass =
  "app2-btn inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--ui-button-radius)] font-[var(--ui-button-font-weight,600)] transition-all duration-200 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";

const variantClass: Record<App2ButtonVariant, string> = {
  primary:
    "border border-transparent bg-[var(--brand-primary)] text-[var(--ui-button-primary-foreground)] shadow-[var(--ui-button-primary-shadow)] hover:brightness-110 active:brightness-105",
  secondary:
    "border border-[var(--app2-theme-border)] bg-transparent text-[var(--brand-primary-light)] hover:border-[color-mix(in_srgb,var(--brand-primary)_50%,transparent)] hover:text-[var(--brand-primary)]",
  ghost:
    "border border-[var(--app2-theme-border)] bg-transparent text-app2-muted hover:border-[color-mix(in_srgb,var(--brand-primary)_40%,transparent)] hover:text-[var(--brand-primary)]",
  promo:
    "border border-transparent bg-[var(--brand-promo-accent)] text-[var(--ui-button-primary-foreground)] shadow-[0_0_24px_var(--app2-glow-promo)] hover:brightness-110 active:brightness-105",
  tab: "border border-transparent bg-transparent text-app2-muted hover:text-[var(--brand-primary-light)]",
  "tab-active":
    "border border-transparent bg-[var(--brand-primary)] text-[var(--ui-button-primary-foreground)]",
};

const sizeClass: Record<App2ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs font-medium tracking-normal",
  md: "px-5 py-2.5 text-sm font-semibold tracking-wide",
  lg: "px-6 py-3 text-sm font-semibold tracking-wide",
  promo: "px-7 py-3.5 text-sm font-bold tracking-wide",
};

type App2ButtonStyleProps = {
  variant?: App2ButtonVariant;
  size?: App2ButtonSize;
  className?: string;
};

export function app2ButtonClassName({
  variant = "primary",
  size = "md",
  className,
}: App2ButtonStyleProps) {
  return cn(baseClass, variantClass[variant], sizeClass[size], className);
}

type App2ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & App2ButtonStyleProps;

export function App2Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: App2ButtonProps) {
  return (
    <button
      type={type}
      className={app2ButtonClassName({ variant, size, className })}
      {...props}
    />
  );
}

type App2ButtonLinkProps = App2ButtonStyleProps & {
  href: string;
  children: ReactNode;
  onClick?: () => void;
};

export function App2ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
}: App2ButtonLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={app2ButtonClassName({ variant, size, className })}
    >
      {children}
    </Link>
  );
}
