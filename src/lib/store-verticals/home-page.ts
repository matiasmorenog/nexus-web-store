import { ApparelHome } from "@/themes/apparel/components/apparel-home";
import { VapeHome } from "@/themes/vape/components/vape-home";
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
