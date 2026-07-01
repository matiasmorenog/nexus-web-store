import type { CSSProperties } from "react";
import { getStore } from "@/lib/store-context";
import { getVerticalConfig } from "@/lib/store-verticals";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await getStore();
  const config = getVerticalConfig();
  const brandPrimary =
    store.primaryColor?.trim() || config.ui.cssVars["--brand-primary"];

  const themeStyle = {
    ...config.ui.cssVars,
    "--brand-primary": brandPrimary,
  } as CSSProperties;

  return (
    <div data-admin-ui={config.ui.id} style={themeStyle} className="contents">
      {children}
    </div>
  );
}
