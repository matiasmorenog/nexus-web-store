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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <main className="flex min-h-0 flex-1 flex-col p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
