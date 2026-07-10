import type { ReactNode } from "react";
import type { StoreMarketingSettingsData } from "@/lib/marketing";
import { MetaPixel } from "@/components/storefront/meta-pixel";
import { WhatsAppFloatButton } from "@/components/storefront/whatsapp-float-button";

type StorefrontMarketingShellProps = {
  settings: StoreMarketingSettingsData;
  children: ReactNode;
};

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
    </>
  );
}
