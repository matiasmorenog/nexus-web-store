import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductEditSections } from "@/components/admin/product-edit-sections";
import {
  adminCanManage,
  requireAdminPermission,
} from "@/lib/admin-session";
import {
  buildQrDownloadFilename,
  getStorefrontProductAbsoluteUrl,
} from "@/lib/admin-store-qr";
import { getBrandPrefix } from "@/lib/brand";
import { db } from "@/lib/db";
import { storeHasModule } from "@/lib/modules";
import { getStore } from "@/lib/store-context";
import { getStoreCategories } from "@/lib/store-categories";
import { productHref } from "@/lib/storefront-paths";
import { getStorefrontConfig } from "@/lib/store-verticals";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const session = await requireAdminPermission("products:view");
  const storeId = session.user.storeId;
  const canManageProducts = adminCanManage(session, "products:manage");

  const product = await db.product.findFirst({
    where: { id: productId, storeId },
  });

  if (!product) notFound();

  const config = getStorefrontConfig();
  const promo2x1Selectable =
    config.features.promo2x1 && (await storeHasModule(storeId, "coupons"));
  const categories = await getStoreCategories(storeId);

  const productUrl = getStorefrontProductAbsoluteUrl(product.slug);
  const store = await getStore();
  const brandColor =
    store.primaryColor?.trim() ||
    config.ui.cssVars["--brand-primary"] ||
    "#171717";

  return (
    <div className="space-y-6 pb-8">
      <div>
        <Link
          href="/admin/productos"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-[var(--brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a productos
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          <span className="inline-block border-b-2 border-[var(--brand-primary)] pb-0.5">
            {product.name}
          </span>
        </h1>
        <Link
          href={productHref(product.slug)}
          target="_blank"
          className="mt-2 inline-block text-sm text-neutral-500 transition-colors hover:text-[var(--brand-primary)]"
        >
          Ver en tienda →
        </Link>
      </div>

      <ProductEditSections
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          audience: product.audience,
          featured: product.featured,
          promo2x1: product.promo2x1,
          active: product.active,
          hasSize: product.hasSize,
        }}
        promo2x1Selectable={promo2x1Selectable}
        canManage={canManageProducts}
        categories={categories}
        qr={{
          url: productUrl,
          filename: buildQrDownloadFilename(product.slug),
          brandPrefix: getBrandPrefix(store.name),
          brandColor,
        }}
      />
    </div>
  );
}
