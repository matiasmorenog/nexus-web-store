import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

type CartEmptyStateProps = {
  onContinue?: () => void;
  compact?: boolean;
};

export function CartEmptyState({ onContinue, compact = false }: CartEmptyStateProps) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-center justify-center px-4 py-12 text-center"
          : "rounded-xl border border-dashed border-neutral-200 bg-[var(--brand-primary-soft)]/40 px-6 py-16 text-center"
      }
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200/80">
        <ShoppingBag className="h-7 w-7 text-[var(--brand-primary)]/70" />
      </div>
      <p className="text-base font-medium text-neutral-900">Tu carrito está vacío</p>
      <p className="mt-1 max-w-xs text-sm text-neutral-500">
        Explorá el catálogo y encontrá tu próxima prenda favorita.
      </p>
      {onContinue ? (
        <Button variant="secondary" className="mt-5" onClick={onContinue}>
          Seguir comprando
        </Button>
      ) : (
        <Link href="/productos" className="mt-5 inline-block">
          <Button variant="secondary">Ver productos</Button>
        </Link>
      )}
    </div>
  );
}
