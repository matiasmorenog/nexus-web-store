import { XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { StorefrontStatusPage } from "@/components/storefront/storefront-status-page";
import { getLocaleCopy } from "@/lib/storefront-locale-copy";
import { getStorefrontPaths } from "@/lib/storefront-paths";
import { getStorefrontConfig } from "@/lib/store-verticals";

export default function CheckoutErrorPage() {
  if (!getStorefrontConfig().features.checkout) {
    redirect(getStorefrontPaths().contact);
  }

  const copy = getLocaleCopy();

  return (
    <StorefrontStatusPage
      icon={XCircle}
      iconClassName="text-red-600"
      title={copy.paymentFailed}
      actionHref={getStorefrontPaths().checkout}
      actionLabel={copy.backToCheckout}
    >
      <p>{copy.paymentFailedDetail}</p>
    </StorefrontStatusPage>
  );
}
