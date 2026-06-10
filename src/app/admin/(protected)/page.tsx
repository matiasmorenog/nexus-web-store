import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return <p>No tenés una tienda asignada.</p>;
  }

  const [productCount, orderCount, paidOrders, recentOrders] = await Promise.all([
    db.product.count({ where: { storeId } }),
    db.order.count({ where: { storeId } }),
    db.order.findMany({
      where: { storeId, status: "PAID" },
      select: { total: true },
    }),
    db.order.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { include: { variant: { include: { product: true } } } } },
    }),
  ]);

  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const stats = [
    { label: "Productos", value: productCount, icon: Package },
    { label: "Pedidos", value: orderCount, icon: ShoppingCart },
    { label: "Ingresos", value: formatPrice(revenue), icon: DollarSign },
    { label: "Ventas pagadas", value: paidOrders.length, icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-semibold">Pedidos recientes</h2>
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Cliente</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Total</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  No hay pedidos aún
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3 capitalize">{order.status.toLowerCase()}</td>
                  <td className="px-4 py-3">{formatPrice(Number(order.total))}</td>
                  <td className="px-4 py-3">
                    {new Date(order.createdAt).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
