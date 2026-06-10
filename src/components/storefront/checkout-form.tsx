"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";

type CheckoutFormProps = {
  shippingCost: number;
};

export function CheckoutForm({ shippingCost }: CheckoutFormProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = subtotal() + shippingCost;

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
    <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>

      <div className="rounded-lg border bg-neutral-50 p-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal())}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>Envío</span>
          <span>{formatPrice(shippingCost)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={loading || items.length === 0}>
        {loading ? "Procesando..." : "Pagar con Mercado Pago"}
      </Button>
    </form>
  );
}
