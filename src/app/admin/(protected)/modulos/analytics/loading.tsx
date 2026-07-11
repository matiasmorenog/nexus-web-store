import {
  AdminSkeletonAdvancedAnalytics,
  AdminSkeletonExportsPanel,
  AdminSkeletonPageHeader,
} from "@/components/admin/admin-skeleton";

export default function AdminAnalyticsLoading() {
  return (
    <div className="space-y-8">
      <AdminSkeletonPageHeader
        titleWidth="w-52"
        descriptionWidth="w-full max-w-2xl"
      />
      <AdminSkeletonAdvancedAnalytics />
      <AdminSkeletonExportsPanel />
    </div>
  );
}
