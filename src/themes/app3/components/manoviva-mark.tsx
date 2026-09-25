import { cn } from "@/lib/utils";

type ManovivaMarkProps = {
  className?: string;
  inverse?: boolean;
};

export function ManovivaMark({ className, inverse = false }: ManovivaMarkProps) {
  return (
    <svg
      viewBox="0 0 88 88"
      aria-hidden="true"
      className={cn("h-12 w-12", className)}
    >
      <path
        d="M17 65V23l27 31 27-31v42"
        fill="none"
        stroke={inverse ? "#fff" : "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <path
        d="M31 65c9-9 18-9 27 0"
        fill="none"
        stroke={inverse ? "#fff" : "#C86243"}
        strokeLinecap="round"
        strokeWidth="5"
      />
      <circle cx="44" cy="18" r="4" fill={inverse ? "#fff" : "#C86243"} />
    </svg>
  );
}
