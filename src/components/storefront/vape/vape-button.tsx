import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type VapeButtonVariant = "primary" | "secondary" | "ghost" | "promo" | "tab" | "tab-active";
export type VapeButtonSize = "sm" | "md" | "lg" | "promo";

const baseClass =
  "vape-btn inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--ui-button-radius)] font-[var(--ui-button-font-weight,600)] transition-all duration-200 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";

const variantClass: Record<VapeButtonVariant, string> = {
  primary:
    "border border-transparent bg-[var(--brand-primary)] text-[var(--ui-button-primary-foreground)] shadow-[var(--ui-button-primary-shadow)] hover:brightness-110 active:brightness-105",
  secondary:
    "border border-[var(--vape-theme-border)] bg-transparent text-[var(--brand-primary-light)] hover:border-[color-mix(in_srgb,var(--brand-primary)_50%,transparent)] hover:text-[var(--brand-primary)]",
  ghost:
    "border border-[var(--vape-theme-border)] bg-transparent text-vape-muted hover:border-[color-mix(in_srgb,var(--brand-primary)_40%,transparent)] hover:text-[var(--brand-primary)]",
  promo:
    "border border-transparent bg-[var(--brand-promo-accent)] text-[var(--ui-button-primary-foreground)] shadow-[0_0_24px_var(--vape-glow-promo)] hover:brightness-110 active:brightness-105",
  tab: "border border-transparent bg-transparent text-vape-muted hover:text-[var(--brand-primary-light)]",
  "tab-active":
    "border border-transparent bg-[var(--brand-primary)] text-[var(--ui-button-primary-foreground)]",
};

const sizeClass: Record<VapeButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs font-medium tracking-normal",
  md: "px-5 py-2.5 text-sm font-semibold tracking-wide",
  lg: "px-6 py-3 text-sm font-semibold tracking-wide",
  promo: "px-7 py-3.5 text-sm font-bold tracking-wide",
};

type VapeButtonStyleProps = {
  variant?: VapeButtonVariant;
  size?: VapeButtonSize;
  className?: string;
};

export function vapeButtonClassName({
  variant = "primary",
  size = "md",
  className,
}: VapeButtonStyleProps) {
  return cn(baseClass, variantClass[variant], sizeClass[size], className);
}

type VapeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VapeButtonStyleProps;

export function VapeButton({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: VapeButtonProps) {
  return (
    <button
      type={type}
      className={vapeButtonClassName({ variant, size, className })}
      {...props}
    />
  );
}

type VapeButtonLinkProps = VapeButtonStyleProps & {
  href: string;
  children: ReactNode;
  onClick?: () => void;
};

export function VapeButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
}: VapeButtonLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={vapeButtonClassName({ variant, size, className })}
    >
      {children}
    </Link>
  );
}
