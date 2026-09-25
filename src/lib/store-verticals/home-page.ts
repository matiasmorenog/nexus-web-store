import { App1Home } from "@/themes/app1/components/app1-home";
import { App2Home } from "@/themes/app2/components/app2-home";
import { ManovivaHome } from "@/themes/app3/components/manoviva-home";
import type { StoreVertical } from "@/lib/store-verticals/types";

type HomePageProps = {
  storeDisplayName: string;
};

export function resolveHomePage(vertical: StoreVertical) {
  const pages = {
    app1: App1Home,
    app2: App2Home,
    app3: ManovivaHome,
  } as const;

  return pages[vertical] as React.ComponentType<HomePageProps>;
}
