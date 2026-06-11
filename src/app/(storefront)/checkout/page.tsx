import { CheckoutView } from "@/components/storefront/checkout-view";
import { getStore } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const store = await getStore();
  const shippingCost = Number(store.shippingFlatRate);

  return (
    <CheckoutView
      shippingCost={shippingCost}
      allowPickup={store.allowPickup}
      storeName={store.name}
    />
  );
}
