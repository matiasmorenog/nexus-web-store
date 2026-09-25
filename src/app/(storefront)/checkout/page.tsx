import { CheckoutView } from "@/components/storefront/checkout-view";
import { getOptionalCustomerSession } from "@/lib/customer-session";
import { storeHasModule } from "@/lib/modules";
import { isCarrierShippingEnabled } from "@/lib/shipping-carriers/query";
import { formatStoreName, getStore } from "@/lib/store-context";
import { getCheckoutPaymentConfig } from "@/lib/payments/server";
import { redirect } from "next/navigation";
import { getStorefrontPaths } from "@/lib/storefront-paths";
import { getStorefrontConfig } from "@/lib/store-verticals";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  if (!getStorefrontConfig().features.checkout) {
    redirect(getStorefrontPaths().contact);
  }

  const store = await getStore();
  const couponsEnabled = await storeHasModule(store.id, "coupons");
  const dynamicShippingEnabled = await isCarrierShippingEnabled(store.id);
  const shippingCost = 0;
  const paymentConfig = await getCheckoutPaymentConfig(store.id);
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
      paymentConfig={paymentConfig}
      defaultCustomer={defaultCustomer}
    />
  );
}
