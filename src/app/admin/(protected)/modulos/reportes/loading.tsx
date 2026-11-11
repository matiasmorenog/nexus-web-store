import {
  AdminSkeletonExportsPanel,
  AdminSkeletonPageHeader,
  AdminSkeletonSalesAnalytics,
} from "@/components/admin/admin-skeleton";

export default function AdminReportsLoading() {
  return (
    <div className="space-y-8">
      <AdminSkeletonPageHeader
        titleWidth="w-32"
        descriptionWidth="w-full max-w-xl"
      />
      <AdminSkeletonSalesAnalytics />
      <AdminSkeletonExportsPanel />
    </div>
  );
}
