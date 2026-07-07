import { AdminCouponCreateForm } from "@/components/admin/admin-coupon-create-form";
import { AdminCouponsList } from "@/components/admin/admin-coupons-list";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAdminSession } from "@/lib/admin-session";
import { serializeCoupon } from "@/lib/coupons/admin";
import { db } from "@/lib/db";
import { requireModule } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireAdminSession();
  await requireModule("coupons");

  const storeId = await getStoreId();
  const coupons = await db.coupon.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Cupones y promociones"
          description="Códigos de descuento para el checkout. El descuento se aplica sobre el subtotal después de promos 2x1."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminCouponCreateForm />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={2}>
        <AdminCouponsList coupons={coupons.map(serializeCoupon)} />
      </AdminDashboardReveal>
    </div>
  );
}
