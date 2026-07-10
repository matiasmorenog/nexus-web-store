import { CheckoutView } from "@/components/storefront/checkout-view";
import { getOptionalCustomerSession } from "@/lib/customer-session";
import { storeHasModule } from "@/lib/modules";
import { isCarrierShippingEnabled } from "@/lib/shipping-carriers/query";
import { formatStoreName, getStore } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const store = await getStore();
  const shippingCost = Number(store.shippingFlatRate);
  const couponsEnabled = await storeHasModule(store.id, "coupons");
  const dynamicShippingEnabled = await isCarrierShippingEnabled(store.id);
  const session = await getOptionalCustomerSession();
  const defaultCustomer = session
    ? {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }
    : undefined;

  return (
    <CheckoutView
      shippingCost={shippingCost}
      allowPickup={store.allowPickup}
      storeName={formatStoreName(store.name)}
      couponsEnabled={couponsEnabled}
      dynamicShippingEnabled={dynamicShippingEnabled}
      defaultCustomer={defaultCustomer}
    />
  );
}
