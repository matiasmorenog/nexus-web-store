import { Suspense } from "react";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getStore } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await getStore();

  return (
    <>
      <Suspense
        fallback={
          <div className="h-[4.625rem] border-b border-neutral-100 bg-white/90 shadow-sm" />
        }
      >
        <Header storeName={store.name} />
      </Suspense>
      <main className="storefront-content-bottom flex-1">{children}</main>
      <Footer storeName={store.name} />
    </>
  );
}
