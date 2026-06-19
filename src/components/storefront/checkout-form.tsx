"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CartPromoSummary } from "@/components/storefront/cart-promo-summary";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type DeliveryMethod = "shipping" | "pickup";

function DeliverySection({
  method,
  active,
  children,
  className,
}: {
  method: DeliveryMethod;
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!active) return null;

  return (
    <div key={method} className={cn("checkout-delivery-enter", className)}>
      {children}
    </div>
  );
}

type CheckoutFormProps = {
  shippingCost: number;
  allowPickup: boolean;
  storeName: string;
  showSummary?: boolean;
};

export function CheckoutForm({
  shippingCost,
  allowPickup,
  storeName,
  showSummary = true,
}: CheckoutFormProps) {
  const router = useRouter();
  const { items, rawSubtotal, promoDiscount, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("shipping");

  const effectiveShipping =
    deliveryMethod === "pickup" ? 0 : shippingCost;
  const total = subtotal() + effectiveShipping;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          customer: data,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error ?? "Error al procesar el checkout");
      }

      if (result.initPoint) {
        clearCart();
        window.location.href = result.initPoint;
      } else if (result.demoMode) {
        clearCart();
        router.push(`/checkout/exito?order=${result.orderId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {allowPickup && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-neutral-900">
            Forma de entrega
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={cn(
                "flex cursor-pointer flex-col rounded-lg border p-4 transition-colors",
                deliveryMethod === "shipping"
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)]"
                  : "border-neutral-200 hover:border-neutral-300",
              )}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value="shipping"
                checked={deliveryMethod === "shipping"}
                onChange={() => setDeliveryMethod("shipping")}
                className="sr-only"
              />
              <span className="font-medium">Envío a domicilio</span>
              <span className="mt-1 text-sm text-neutral-600">
                {shippingCost > 0
                  ? formatPrice(shippingCost)
                  : "Sin costo de envío"}
              </span>
            </label>
            <label
              className={cn(
                "flex cursor-pointer flex-col rounded-lg border p-4 transition-colors",
                deliveryMethod === "pickup"
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)]"
                  : "border-neutral-200 hover:border-neutral-300",
              )}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value="pickup"
                checked={deliveryMethod === "pickup"}
                onChange={() => setDeliveryMethod("pickup")}
                className="sr-only"
              />
              <span className="font-medium">Retiro en local</span>
              <span className="mt-1 text-sm text-neutral-600">Sin costo</span>
            </label>
          </div>
          <DeliverySection method="pickup" active={deliveryMethod === "pickup"}>
            <p className="text-sm text-neutral-600">
              Retirás tu pedido en {storeName}. Te avisaremos por email cuando
              esté listo.
            </p>
          </DeliverySection>
        </fieldset>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" required />
        </div>

        <DeliverySection
          method="shipping"
          active={deliveryMethod === "shipping"}
          className="grid gap-4 sm:col-span-2 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" required />
          </div>
          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" name="city" required />
          </div>
          <div>
            <Label htmlFor="zip">Código postal</Label>
            <Input id="zip" name="zip" required />
          </div>
        </DeliverySection>
      </div>

      {showSummary ? (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-4 text-sm">
          <CartPromoSummary
            rawSubtotal={rawSubtotal()}
            promoDiscount={promoDiscount()}
            subtotal={subtotal()}
          />
          <DeliverySection
            method={deliveryMethod}
            active
            className="mt-1 flex justify-between text-neutral-600"
          >
            <span>
              {deliveryMethod === "pickup" ? "Retiro en local" : "Envío"}
            </span>
            <span>
              {deliveryMethod === "pickup"
                ? "Sin costo"
                : formatPrice(effectiveShipping)}
            </span>
          </DeliverySection>
          <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold text-neutral-900">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>
      ) : (
        <DeliverySection
          method={deliveryMethod}
          active
          className="flex items-baseline justify-between border-t border-neutral-100 pt-4"
        >
          <span className="text-sm text-neutral-600">Total a pagar</span>
          <span className="text-xl font-bold tabular-nums text-neutral-900">
            {formatPrice(total)}
          </span>
        </DeliverySection>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={loading || items.length === 0}>
        {loading ? "Procesando..." : "Pagar con Mercado Pago"}
      </Button>
    </form>
  );
}
