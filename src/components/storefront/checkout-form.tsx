"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { CartPromoSummary } from "@/components/storefront/cart-promo-summary";
import {
  CheckoutCouponField,
  type AppliedCheckoutCoupon,
} from "@/components/storefront/checkout-coupon-field";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type DeliveryMethod = "shipping" | "pickup";

type ShippingQuote = {
  cost: number;
  deliveryWindow: string;
  demoMode: boolean;
};

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

function readFormField(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name);
  if (!field || !("value" in field)) return "";
  return String(field.value).trim();
}

type CheckoutFormProps = {
  shippingCost: number;
  allowPickup: boolean;
  storeName: string;
  showSummary?: boolean;
  couponsEnabled?: boolean;
  appliedCoupon?: AppliedCheckoutCoupon | null;
  onCouponChange?: (coupon: AppliedCheckoutCoupon | null) => void;
  defaultCustomer?: {
    name: string;
    email: string;
  };
};

export function CheckoutForm({
  shippingCost,
  allowPickup,
  storeName,
  showSummary = true,
  couponsEnabled = false,
  appliedCoupon = null,
  onCouponChange,
  defaultCustomer,
}: CheckoutFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const { items, rawSubtotal, promoDiscount, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("shipping");
  const [zip, setZip] = useState("");
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const syncZipFromInput = useCallback(() => {
    const value = zipInputRef.current?.value ?? "";
    setZip(value);
  }, []);

  useEffect(() => {
    const input = zipInputRef.current;
    if (!input) return;

    const onAutoFill = () => syncZipFromInput();
    input.addEventListener("input", onAutoFill);
    input.addEventListener("change", onAutoFill);
    input.addEventListener("animationstart", onAutoFill);

    return () => {
      input.removeEventListener("input", onAutoFill);
      input.removeEventListener("change", onAutoFill);
      input.removeEventListener("animationstart", onAutoFill);
    };
  }, [syncZipFromInput, deliveryMethod]);

  const quotedShipping = shippingQuote?.cost ?? shippingCost;
  const effectiveShipping =
    deliveryMethod === "pickup" ? 0 : quotedShipping;
  const orderSubtotal = subtotal();
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const subtotalAfterCoupon = Math.max(0, orderSubtotal - couponDiscount);
  const total = subtotalAfterCoupon + effectiveShipping;

  useEffect(() => {
    if (deliveryMethod !== "shipping") {
      setShippingQuote(null);
      return;
    }

    const normalizedZip = zip.replace(/\D/g, "");
    if (normalizedZip.length < 4) {
      setShippingQuote(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setQuoteLoading(true);
      try {
        const res = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zip: normalizedZip }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error al cotizar");

        setShippingQuote({
          cost: data.cost,
          deliveryWindow: data.deliveryWindow,
          demoMode: Boolean(data.demoMode),
        });
      } catch (quoteError) {
        if (quoteError instanceof DOMException && quoteError.name === "AbortError") {
          return;
        }
        setShippingQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [deliveryMethod, zip]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError("");

    const form = e.currentTarget;
    syncZipFromInput();

    const customer = {
      name: readFormField(form, "name"),
      email: readFormField(form, "email"),
      phone: readFormField(form, "phone"),
      address: readFormField(form, "address"),
      city: readFormField(form, "city"),
      zip: readFormField(form, "zip"),
    };

    if (deliveryMethod === "shipping") {
      if (!customer.address) {
        setError("Completá la dirección de envío.");
        setLoading(false);
        return;
      }
      if (!customer.city) {
        setError("Completá la ciudad.");
        setLoading(false);
        return;
      }
      if (!customer.zip) {
        setError("Completá el código postal.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          customer,
          couponCode: appliedCoupon?.code,
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
    <form
      ref={formRef}
      id="checkout-form"
      autoComplete="on"
      onSubmit={handleSubmit}
      className="space-y-6"
    >
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
              <span className="flex items-center gap-2 font-medium">
                <Truck className="size-4 text-[#3483fa]" aria-hidden />
                Mercado Envíos
              </span>
              <span className="mt-1 text-sm text-neutral-600">
                {quoteLoading
                  ? "Calculando envío..."
                  : effectiveShipping > 0
                    ? formatPrice(effectiveShipping)
                    : "Ingresá tu CP para cotizar"}
              </span>
              {shippingQuote && deliveryMethod === "shipping" ? (
                <span className="mt-1 text-xs text-neutral-500">
                  Llega en {shippingQuote.deliveryWindow}
                  {shippingQuote.demoMode ? " · demo" : ""}
                </span>
              ) : null}
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

      {!allowPickup && deliveryMethod === "shipping" ? (
        <div className="rounded-lg border border-[#3483fa]/20 bg-[#3483fa]/5 px-4 py-3 text-sm text-neutral-700">
          <p className="flex items-center gap-2 font-medium text-neutral-900">
            <Truck className="size-4 text-[#3483fa]" aria-hidden />
            Envío con Mercado Envíos
          </p>
          <p className="mt-1 text-neutral-600">
            {quoteLoading
              ? "Calculando costo y plazo..."
              : shippingQuote
                ? `${formatPrice(effectiveShipping)} · llega en ${shippingQuote.deliveryWindow}`
                : "Ingresá tu código postal para cotizar el envío."}
          </p>
        </div>
      ) : null}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Datos de contacto</legend>
        <div className="sm:col-span-2">
          <Label htmlFor="checkout-name">Nombre completo</Label>
          <Input
            id="checkout-name"
            name="name"
            autoComplete="name"
            defaultValue={defaultCustomer?.name}
            required
          />
        </div>
        <div>
          <Label htmlFor="checkout-email">Email</Label>
          <Input
            id="checkout-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={defaultCustomer?.email}
            required
          />
        </div>
        <div>
          <Label htmlFor="checkout-phone">Teléfono</Label>
          <Input
            id="checkout-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
          />
        </div>
      </fieldset>

      <fieldset
        disabled={deliveryMethod === "pickup"}
        hidden={deliveryMethod === "pickup"}
        className="grid gap-4 sm:grid-cols-2"
      >
        <legend className="mb-1 text-sm font-medium text-neutral-900 sm:col-span-2">
          Dirección de envío
        </legend>
        <div className="sm:col-span-2">
          <Label htmlFor="checkout-address">Dirección</Label>
          <Input
            id="checkout-address"
            name="address"
            autoComplete="shipping street-address"
            required={deliveryMethod === "shipping"}
          />
        </div>
        <div>
          <Label htmlFor="checkout-city">Ciudad</Label>
          <Input
            id="checkout-city"
            name="city"
            autoComplete="shipping address-level2"
            required={deliveryMethod === "shipping"}
          />
        </div>
        <div>
          <Label htmlFor="checkout-zip">Código postal</Label>
          <Input
            ref={zipInputRef}
            id="checkout-zip"
            name="zip"
            autoComplete="shipping postal-code"
            inputMode="numeric"
            required={deliveryMethod === "shipping"}
            onInput={syncZipFromInput}
            onChange={syncZipFromInput}
          />
        </div>
      </fieldset>

      {couponsEnabled ? (
        <CheckoutCouponField
          subtotal={orderSubtotal}
          applied={appliedCoupon}
          onApplied={(coupon) => onCouponChange?.(coupon)}
        />
      ) : null}

      {showSummary ? (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-4 text-sm">
          <CartPromoSummary
            rawSubtotal={rawSubtotal()}
            promoDiscount={promoDiscount()}
            subtotal={orderSubtotal}
            couponCode={appliedCoupon?.code}
            couponDiscount={couponDiscount}
            totalAfterDiscounts={subtotalAfterCoupon}
          />
          <DeliverySection
            method={deliveryMethod}
            active
            className="mt-1 flex justify-between text-neutral-600"
          >
            <span>
              {deliveryMethod === "pickup"
                ? "Retiro en local"
                : "Mercado Envíos"}
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
