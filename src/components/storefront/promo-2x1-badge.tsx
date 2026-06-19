import { cn } from "@/lib/utils";

type Promo2x1BadgeProps = {
  className?: string;
  size?: "sm" | "md";
  /** Más contraste sobre fotos de producto en la grilla. */
  onImage?: boolean;
};

export function Promo2x1Badge({
  className,
  size = "sm",
  onImage = false,
}: Promo2x1BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold uppercase tracking-wide text-white",
        onImage
          ? "rounded-full bg-[var(--brand-primary)] px-2.5 py-1 text-[11px] shadow-md ring-2 ring-white/90"
          : "rounded-md bg-[var(--brand-primary)] font-semibold",
        !onImage && size === "sm" && "px-2 py-0.5 text-[10px]",
        !onImage && size === "md" && "px-2.5 py-1 text-xs",
        className,
      )}
    >
      2x1
    </span>
  );
}
