import {
  AdminSkeletonPageHeader,
  AdminSkeletonWebTraffic,
} from "@/components/admin/admin-skeleton";

export default function AdminTrafficLoading() {
  return (
    <div className="space-y-8">
      <AdminSkeletonPageHeader
        titleWidth="w-28"
        descriptionWidth="w-full max-w-2xl"
      />
      <AdminSkeletonWebTraffic />
    </div>
  );
}
