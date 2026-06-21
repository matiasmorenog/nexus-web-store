import { cn } from "@/lib/utils";

type Promo2x1BadgeProps = {
  className?: string;
  size?: "sm" | "md";
  /** Más contraste sobre fotos de producto en la grilla. */
  onImage?: boolean;
  label?: string;
};

export function Promo2x1Badge({
  className,
  size = "sm",
  onImage = false,
  label = "2x1",
}: Promo2x1BadgeProps) {
  return (
    <span
      className={cn(
        "promo-2x1-badge inline-flex items-center font-semibold uppercase tracking-wide text-white",
        onImage
          ? "rounded-md px-2 py-0.5 text-[10px] shadow-sm ring-1 ring-white/80"
          : "rounded-md font-semibold",
        !onImage && size === "sm" && "px-2 py-0.5 text-[10px]",
        !onImage && size === "md" && "px-2.5 py-1 text-xs",
        className,
      )}
    >
      {label}
    </span>
  );
}
