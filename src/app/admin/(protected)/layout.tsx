import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, Settings, ShoppingCart } from "lucide-react";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { auth } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

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
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="relative hidden w-64 shrink-0 border-r bg-white lg:block">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="font-bold">
            Alaska <span className="font-normal text-neutral-500">Admin</span>
          </Link>
        </div>
        <nav className="p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 border-t p-4">
          <SignOutButton />
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 lg:hidden">
          <Link href="/admin" className="font-bold">
            Alaska Admin
          </Link>
          <nav className="flex gap-4 text-sm">
            {navItems.slice(1).map((item) => (
              <Link key={item.href} href={item.href} className="text-neutral-600">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
