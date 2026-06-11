import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { getOrderStatusLabel, getOrderStatusVariant } from "@/lib/order-status";

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
    }),
  ]);

  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const stats = [
    { label: "Productos", value: productCount, icon: Package, accent: "brand" as const },
    { label: "Pedidos", value: orderCount, icon: ShoppingCart, accent: "blue" as const },
    { label: "Ingresos", value: formatPrice(revenue), icon: DollarSign, accent: "green" as const },
    { label: "Ventas pagadas", value: paidOrders.length, icon: TrendingUp, accent: "amber" as const },
  ];

  return (
    <div className="pb-2">
      <AdminPageHeader
        title="Dashboard"
        description="Resumen de tu tienda Alaska Indumentaria."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <AdminStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <AdminCard title="Pedidos recientes" padding={false}>
        <div className="admin-table-scroll">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50/80">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-neutral-600">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left font-medium text-neutral-600">
                  Estado
                </th>
                <th className="px-6 py-3 text-left font-medium text-neutral-600">
                  Total
                </th>
                <th className="px-6 py-3 text-left font-medium text-neutral-600">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                    No hay pedidos aún
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getOrderStatusVariant(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
