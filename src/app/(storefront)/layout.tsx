import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { formatStoreName, getStore } from "@/lib/store-context";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore();
  const displayName = formatStoreName(store.name);

  return {
    title: {
      default: displayName,
      template: `%s | ${displayName}`,
    },
    description:
      "Ropa deportiva y CrossFit. Indumentaria para entrenar sin límites.",
  };
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await getStore();
  const displayName = formatStoreName(store.name);

  return (
    <>
      <Suspense
        fallback={
          <div className="h-[4.625rem] border-b border-neutral-100 bg-white/90 shadow-sm" />
        }
      >
        <Header storeName={displayName} />
      </Suspense>
      <main className="storefront-content-bottom flex-1">{children}</main>
      <Footer storeName={displayName} />
    </>
  );
}
