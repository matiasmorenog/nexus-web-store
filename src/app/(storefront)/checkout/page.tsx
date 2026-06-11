import { CheckoutForm } from "@/components/storefront/checkout-form";
import { getStore } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const store = await getStore();
  const shippingCost = Number(store.shippingFlatRate);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Checkout</h1>
      <p className="mb-8 text-neutral-600">Completá tus datos para finalizar la compra.</p>
      <CheckoutForm
        shippingCost={shippingCost}
        allowPickup={store.allowPickup}
        storeName={store.name}
      />
    </div>
  );
}
