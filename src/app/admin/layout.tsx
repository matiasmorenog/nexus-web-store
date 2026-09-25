import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { formatStoreName, getStore } from "@/lib/store-context";
import { getStorefrontConfig } from "@/lib/store-verticals";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore();
  const displayName = formatStoreName(store.name);

  return {
    title: displayName,
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await getStore();
  const config = getStorefrontConfig();
  const brandPrimary =
    store.primaryColor?.trim() || config.ui.cssVars["--brand-primary"];

  const themeStyle = {
    ...config.ui.cssVars,
    "--brand-primary": brandPrimary,
    "--ui-button-radius": "0.5rem",
  } as CSSProperties;

  return (
    <div data-admin-ui={config.ui.id} style={themeStyle} className="contents">
      {children}
    </div>
  );
}
