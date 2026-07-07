"use client";

import { useEffect } from "react";
import { trackMetaPixelEvent } from "@/components/storefront/meta-pixel";

type MetaPixelPurchaseEventProps = {
  value: number;
  currency?: string;
  orderId: string;
};

export function MetaPixelPurchaseEvent({
  value,
  currency = "ARS",
  orderId,
}: MetaPixelPurchaseEventProps) {
  useEffect(() => {
    trackMetaPixelEvent("Purchase", {
      value,
      currency,
      content_type: "product",
      order_id: orderId,
    });
  }, [currency, orderId, value]);

  return null;
}
