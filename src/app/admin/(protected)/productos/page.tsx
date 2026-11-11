import { Suspense } from "react";
import { cookies } from "next/headers";
import { AdminProductsPageContent } from "@/components/admin/admin-products-sections";
import { AdminSkeletonProductsPage } from "@/components/admin/admin-skeleton";
import { getActiveAdminProductFilterChips } from "@/lib/admin-product-filters";
import {
  ADMIN_LOCALE_COOKIE,
  parseAdminLocale,
} from "@/lib/admin-locale";
import {
  adminCanManage,
  requireAdminPermission,
} from "@/lib/admin-session";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  categoria?: string;
  genero?: string;
  estado?: string;
  stock?: string;
  orden?: string;
}>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireAdminPermission("products:view");
  const storeId = session.user.storeId;
  const canManageProducts = adminCanManage(session, "products:manage");
  const cookieStore = await cookies();
  const locale = parseAdminLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);

  const params = await searchParams;
  const filters = {
    q: params.q,
    categoria: params.categoria,
    genero: params.genero,
    estado: params.estado,
    stock: params.stock,
    orden: params.orden,
  };

  const filterChips = getActiveAdminProductFilterChips(filters, locale);

  return (
    <div>
      <Suspense fallback={<AdminSkeletonProductsPage />}>
        <AdminProductsPageContent
          storeId={storeId}
          filters={filters}
          filterChips={filterChips}
          locale={locale}
          canManageProducts={canManageProducts}
        />
      </Suspense>
    </div>
  );
}
