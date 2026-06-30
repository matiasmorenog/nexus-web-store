import { ApparelHome } from "@/components/storefront/home/apparel-home";
import { VapeHome } from "@/components/storefront/home/vape-home";
import type { StoreVertical } from "@/lib/store-verticals/types";

type HomePageProps = {
  storeDisplayName: string;
};

export function resolveHomePage(vertical: StoreVertical) {
  const pages = {
    apparel: ApparelHome,
    vape: VapeHome,
  } as const;

  return pages[vertical] as React.ComponentType<HomePageProps>;
}
