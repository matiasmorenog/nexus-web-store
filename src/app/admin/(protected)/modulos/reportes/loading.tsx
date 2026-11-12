import {
  AdminSkeletonExportsPanel,
  AdminSkeletonSalesAnalytics,
} from "@/components/admin/admin-skeleton";

export default function AdminReportsLoading() {
  return (
    <div className="space-y-8">
      <AdminSkeletonSalesAnalytics />
      <AdminSkeletonExportsPanel />
    </div>
  );
}
