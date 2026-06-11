import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { auth } from "@/lib/auth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f6f6f7] lg:flex-row">
      <AdminNav
        userName={session.user?.name}
        userEmail={session.user?.email}
      />
      <div className="admin-content-bottom flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        <main className="flex flex-col">{children}</main>
      </div>
    </div>
  );
}
