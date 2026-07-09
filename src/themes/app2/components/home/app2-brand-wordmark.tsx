import { getBrandPrefix } from "@/lib/brand";
import { cn } from "@/lib/utils";

type App2BrandWordmarkProps = {
  storeName: string;
  size?: "sm" | "md";
  className?: string;
};

type BrandSplit = {
  prefix: string;
  accent: string | null;
};

function splitBrandWordmark(brand: string): BrandSplit {
  const upper = brand.toUpperCase();
  if (upper.endsWith("X") && upper.length > 1) {
    return { prefix: upper.slice(0, -1), accent: "X" };
  }
  return { prefix: upper, accent: null };
}

/** Monograma VX: V y X superpuestas con desplazamiento diagonal. */
export function VaporXMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <text
        x="5"
        y="20"
        fill="currentColor"
        fontSize="17"
        fontWeight="700"
        fontFamily="Rajdhani, system-ui, sans-serif"
        opacity="0.45"
      >
        V
      </text>
      <text
        x="11"
        y="27"
        fill="currentColor"
        fontSize="17"
        fontWeight="700"
        fontFamily="Rajdhani, system-ui, sans-serif"
      >
        X
      </text>
    </svg>
  );
}

const SIZE = {
  sm: {
    mark: "h-8 w-8",
    text: "text-xl",
    gap: "gap-2.5",
  },
  md: {
    mark: "h-9 w-9 sm:h-10 sm:w-10",
    text: "text-[1.35rem] sm:text-2xl",
    gap: "gap-3",
  },
} as const;

export function App2BrandWordmark({
  storeName,
  size = "md",
  className = "",
}: App2BrandWordmarkProps) {
  const { prefix, accent } = splitBrandWordmark(getBrandPrefix(storeName));
  const s = SIZE[size];

  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <VaporXMark className={cn(s.mark, "shrink-0 text-[var(--brand-primary)]")} />
      <span
        className={cn(
          "font-app2-display font-bold tracking-[0.16em] text-[var(--brand-primary-light,#f0f0f5)]",
          s.text,
        )}
      >
        {prefix}
        {accent ? (
          <span className="text-[var(--brand-primary)] text-glow-primary">{accent}</span>
        ) : null}
      </span>
    </span>
  );
}
