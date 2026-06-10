import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { auth } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Alaska Indumentaria</h1>
          <p className="mt-1 text-sm text-neutral-500">Panel de administración</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/" className="hover:underline">
            Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
}
