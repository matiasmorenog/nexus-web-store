"use client";

import { useEffect, useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import type { TopProduct } from "@/lib/admin-analytics-shared";

type AdminTopProductsProps = {
  products: TopProduct[];
};

function TopProductRow({
  product,
  index,
  width,
}: {
  product: TopProduct;
  index: number;
  width: number;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      const frame = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(frame);
    }

    const timeout = window.setTimeout(() => {
      requestAnimationFrame(() => setReady(true));
    }, 280 + index * 90);

    return () => window.clearTimeout(timeout);
  }, [index]);

  return (
    <li
      className={cn(
        ready ? "admin-top-product-enter" : "admin-top-product-prep",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="mb-1.5 flex items-start justify-between gap-3 text-sm">
        <div className="min-w-0">
          <p className="font-medium text-neutral-900">
            <span className="mr-2 tabular-nums text-neutral-400">
              {index + 1}.
            </span>
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
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[color-mix(in_srgb,var(--brand-primary)_72%,white)]",
            ready ? "admin-top-product-bar-enter" : "w-0",
          )}
          style={{ width: ready ? `${Math.max(width, 6)}%` : undefined }}
        />
      </div>
    </li>
  );
}

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
          <TopProductRow
            key={product.productId}
            product={product}
            index={index}
            width={width}
          />
        );
      })}
    </ul>
  );
}
