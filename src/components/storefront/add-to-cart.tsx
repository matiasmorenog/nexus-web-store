"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { Promo2x1Badge } from "@/components/storefront/promo-2x1-badge";
import type { VariantLabels } from "@/lib/store-verticals/types";

type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
  price: number;
  imageUrl: string;
};

type AddToCartProps = {
  productId: string;
  productName: string;
  productSlug: string;
  promo2x1?: boolean;
  showSizeGuideLink?: boolean;
  variantLabels?: VariantLabels;
  variants: Variant[];
};

function scrollToSizeGuide() {
  document.getElementById("size-guide")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function AddToCart({
  productId,
  productName,
  productSlug,
  promo2x1 = false,
  showSizeGuideLink = false,
  variantLabels = { primary: "Color", secondary: "Talle" },
  variants,
}: AddToCartProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const colors = [...new Set(variants.map((v) => v.color))];
  const sizes = [...new Set(variants.map((v) => v.size))];

  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
  const [added, setAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const selectedVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize,
  );

  const availableSizes = sizes.filter((size) =>
    variants.some((v) => v.color === selectedColor && v.size === size && v.stock > 0),
  );

  const buildCartItem = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return null;

    return {
      variantId: selectedVariant.id,
      productId,
      productName,
      productSlug,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: Number(selectedVariant.price),
      imageUrl: selectedVariant.imageUrl,
      stock: selectedVariant.stock,
      promo2x1,
    };
  };

  const handleAdd = () => {
    const item = buildCartItem();
    if (!item) return;

    addItem(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    const item = buildCartItem();
    if (!item) return;

    setBuyingNow(true);
    addItem(item);
    router.push("/checkout");
  };

  const outOfStock = !selectedVariant || selectedVariant.stock <= 0;
  const disabled = outOfStock || added || buyingNow;

  return (
    <div className="space-y-6">
      {promo2x1 && (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--brand-primary)]/25 bg-[var(--brand-primary-soft)] px-4 py-3">
          <Promo2x1Badge size="md" className="shrink-0" />
          <p className="text-sm text-neutral-700">
            Promoción <strong>2x1</strong>: agregá dos unidades del mismo
            producto (cualquier talle o color) y pagá una.
          </p>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium">{variantLabels.primary}</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                const firstSize = variants.find((v) => v.color === color && v.stock > 0)?.size;
                if (firstSize) setSelectedSize(firstSize);
              }}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                selectedColor === color
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                  : "border-neutral-200 bg-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]",
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{variantLabels.secondary}</p>
          {showSizeGuideLink && (
            <button
              type="button"
              onClick={scrollToSizeGuide}
              className="text-xs font-medium text-[var(--brand-primary)] underline-offset-2 transition-colors hover:underline"
            >
              Guía de talles
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const available = availableSizes.includes(size);
            return (
              <button
                key={size}
                disabled={!available}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "min-w-[3rem] rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  selectedSize === size
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                    : available
                      ? "border-neutral-200 bg-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                      : "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300 line-through",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {selectedVariant && (
        <p className="text-2xl font-bold">{formatPrice(Number(selectedVariant.price))}</p>
      )}

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          variant="primary"
          className="w-full"
          onClick={handleBuyNow}
          disabled={disabled}
        >
          {buyingNow
            ? "Redirigiendo..."
            : outOfStock
              ? "Sin stock"
              : "Comprar ahora"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className={cn("w-full", added && "cart-add-success")}
          onClick={handleAdd}
          disabled={disabled}
        >
          {added ? (
            <span className="inline-flex items-center gap-2">
              <Check className="h-5 w-5" aria-hidden />
              ¡Agregado!
            </span>
          ) : outOfStock ? (
            "Sin stock"
          ) : (
            "Agregar al carrito"
          )}
        </Button>
      </div>
    </div>
  );
}
