import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import type { StoreMarketingSettingsData } from "@/lib/marketing";
import { MetaPixel } from "@/components/storefront/meta-pixel";
import { WhatsAppFloatButton } from "@/components/storefront/whatsapp-float-button";

type StorefrontMarketingShellProps = {
  settings: StoreMarketingSettingsData;
  children: ReactNode;
};

/**
 * Shared storefront chrome for all stores (Goat / VAPORX / Manoviva).
 * Vercel Web Analytics lives here so admin traffic stays out of site visit counts.
 * Enable Web Analytics in each Vercel project dashboard (see DEPLOY.md).
 */
export function StorefrontMarketingShell({
  settings,
  children,
}: StorefrontMarketingShellProps) {
  const showPixel =
    settings.metaPixelEnabled && Boolean(settings.metaPixelId?.trim());
  const showWhatsApp =
    settings.whatsappEnabled && Boolean(settings.whatsappPhone?.trim());

  return (
    <>
      {showPixel ? <MetaPixel pixelId={settings.metaPixelId!} /> : null}
      {children}
      {showWhatsApp ? (
        <WhatsAppFloatButton
          phone={settings.whatsappPhone!}
          message={settings.whatsappMessage}
        />
      ) : null}
      <Analytics />
    </>
  );
}
