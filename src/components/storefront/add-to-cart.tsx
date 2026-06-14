"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

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
  variants: Variant[];
};

export function AddToCart({ productId, productName, productSlug, variants }: AddToCartProps) {
  const addItem = useCartStore((s) => s.addItem);
  const colors = [...new Set(variants.map((v) => v.color))];
  const sizes = [...new Set(variants.map((v) => v.size))];

  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
  const [added, setAdded] = useState(false);

  const selectedVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize,
  );

  const availableSizes = sizes.filter((size) =>
    variants.some((v) => v.color === selectedColor && v.size === size && v.stock > 0),
  );

  const handleAdd = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    addItem({
      variantId: selectedVariant.id,
      productId,
      productName,
      productSlug,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: Number(selectedVariant.price),
      imageUrl: selectedVariant.imageUrl,
      stock: selectedVariant.stock,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium">Color</p>
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
        <p className="mb-2 text-sm font-medium">Talle</p>
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

      <Button
        size="lg"
        className={cn("w-full", added && "cart-add-success")}
        onClick={handleAdd}
        disabled={!selectedVariant || selectedVariant.stock <= 0 || added}
      >
        {added ? (
          <span className="inline-flex items-center gap-2">
            <Check className="h-5 w-5" aria-hidden />
            ¡Agregado!
          </span>
        ) : selectedVariant && selectedVariant.stock > 0 ? (
          "Agregar al carrito"
        ) : (
          "Sin stock"
        )}
      </Button>
    </div>
  );
}
