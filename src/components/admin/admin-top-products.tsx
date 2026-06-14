import { formatPrice } from "@/lib/utils";
import type { TopProduct } from "@/lib/admin-analytics";

type AdminTopProductsProps = {
  products: TopProduct[];
};

export function AdminTopProducts({ products }: AdminTopProductsProps) {
  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-500">
        Aún no hay ventas para mostrar un ranking.
      </p>
    );
  }

  const maxQuantity = Math.max(...products.map((product) => product.quantity), 1);

  return (
    <ul className="space-y-4">
      {products.map((product, index) => {
        const width = Math.round((product.quantity / maxQuantity) * 100);

        return (
          <li key={product.productId}>
            <div className="mb-1.5 flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">
                  <span className="mr-2 text-neutral-400">{index + 1}.</span>
                  {product.name}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {product.quantity} unidad{product.quantity !== 1 ? "es" : ""} ·{" "}
                  {formatPrice(product.revenue)}
                </p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-[var(--brand-primary)]"
                style={{ width: `${Math.max(width, 6)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
