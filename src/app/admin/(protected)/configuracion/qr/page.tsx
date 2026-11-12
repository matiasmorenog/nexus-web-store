import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminStoreQrBuilder } from "@/components/admin/admin-store-qr-builder";
import { requireAdminPermission } from "@/lib/admin-session";
import {
  getStorefrontHomeAbsoluteUrl,
  type AdminQrProductOption,
} from "@/lib/admin-store-qr";
import { getBrandPrefix } from "@/lib/brand";
import { db } from "@/lib/db";
import { getStore } from "@/lib/store-context";
import { pathsForLocale } from "@/lib/storefront-paths";
import { getStorefrontConfig } from "@/lib/store-verticals";

export const dynamic = "force-dynamic";

export default async function AdminStoreQrPage() {
  const session = await requireAdminPermission("config:view");

  const store = await getStore();
  const config = getStorefrontConfig();
  const brandColor =
    store.primaryColor?.trim() || config.ui.cssVars["--brand-primary"] || "#171717";
  const products = (await db.product.findMany({
    where: { storeId: session.user.storeId, active: true },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
    take: 500,
  })) satisfies AdminQrProductOption[];

  const homeUrl = getStorefrontHomeAbsoluteUrl();
  const productBasePath = pathsForLocale(config.locale).product;

  return (
    <div className="space-y-6">
      <AdminDashboardReveal index={0}>
        <AdminStoreQrBuilder
          homeUrl={homeUrl}
          productBasePath={productBasePath}
          products={products}
          brandPrefix={getBrandPrefix(store.name)}
          brandColor={brandColor}
        />
      </AdminDashboardReveal>
    </div>
  );
}
