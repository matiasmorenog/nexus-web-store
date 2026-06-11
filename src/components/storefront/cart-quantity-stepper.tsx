import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type CartQuantityStepperProps = {
  quantity: number;
  max: number;
  onDecrease: () => void;
  onIncrease: () => void;
  compact?: boolean;
};

export function CartQuantityStepper({
  quantity,
  max,
  onDecrease,
  onIncrease,
  compact = false,
}: CartQuantityStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-neutral-200 bg-white",
        compact ? "text-sm" : "",
      )}
    >
      <button
        type="button"
        aria-label="Quitar una unidad"
        onClick={onDecrease}
        disabled={quantity <= 1}
        className="rounded-l-lg px-2.5 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>
      <span
        className={cn(
          "min-w-[2rem] border-x border-neutral-200 text-center font-medium tabular-nums text-neutral-900",
          compact ? "px-2 py-1 text-sm" : "px-3 py-1.5 text-sm",
        )}
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Agregar una unidad"
        onClick={onIncrease}
        disabled={quantity >= max}
        className="rounded-r-lg px-2.5 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>
    </div>
  );
}
