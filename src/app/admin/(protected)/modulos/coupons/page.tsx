import { AdminCouponCreateForm } from "@/components/admin/admin-coupon-create-form";
import { AdminCouponsList } from "@/components/admin/admin-coupons-list";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPromotionSettingsForm } from "@/components/admin/admin-promotion-settings-form";
import { requireAdminModuleView } from "@/lib/admin-session";

import { serializeCoupon } from "@/lib/coupons/admin";
import { db } from "@/lib/db";
import { requireModule } from "@/lib/modules";
import { getStorePromotionSettingsForAdmin } from "@/lib/promotions";
import { getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireAdminModuleView("coupons");
  await requireModule("coupons");

  const storeId = await getStoreId();
  const [coupons, promotionSettings] = await Promise.all([
    db.coupon.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    }),
    getStorePromotionSettingsForAdmin(storeId),
  ]);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={1}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 w-full max-w-3xl">
            <AdminCouponCreateForm />
          </div>
          <div className="w-full shrink-0 lg:w-80">
            <AdminPromotionSettingsForm initialSettings={promotionSettings} />
          </div>
        </div>
      </AdminDashboardReveal>

      <AdminDashboardReveal index={2}>
        <AdminCouponsList coupons={coupons.map(serializeCoupon)} />
      </AdminDashboardReveal>
    </div>
  );
}
