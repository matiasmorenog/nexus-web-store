import { Suspense } from "react";
import { AdminActivityChart } from "@/components/admin/admin-activity-chart";
import { AdminActivityPeriodTabs } from "@/components/admin/admin-activity-period-tabs";
import { AdminSkeletonTabs } from "@/components/admin/admin-skeleton";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableRow,
} from "@/components/admin/admin-table";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard, type AdminStatCardIcon } from "@/components/admin/admin-stat-card";
import { AdminTopProducts } from "@/components/admin/admin-top-products";
import { Badge } from "@/components/ui/badge";
import {
  ACTIVITY_PERIOD_LABELS,
  getDashboardAnalytics,
  parseActivityPeriod,
} from "@/lib/admin-analytics";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStoreDisplayName } from "@/lib/store-context";
import { formatPrice } from "@/lib/utils";
import { getOrderStatusLabel, getOrderStatusVariant } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return <p>No tenés una tienda asignada.</p>;
  }

  const params = await searchParams;
  const period = parseActivityPeriod(params.period);
  const periodLabels = ACTIVITY_PERIOD_LABELS[period];
  const storeDisplayName = await getStoreDisplayName();

  const [productCount, orderCount, paidOrders, recentOrders, analytics] =
    await Promise.all([
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
      getDashboardAnalytics(storeId, period),
    ]);

  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const stats: {
    label: string;
    value: number;
    format: "number" | "currency";
    icon: AdminStatCardIcon;
    accent: "brand" | "blue" | "green" | "amber";
    href?: string;
  }[] = [
    {
      label: "Productos",
      value: productCount,
      format: "number" as const,
      icon: "package",
      accent: "brand" as const,
      href: "/admin/productos",
    },
    {
      label: "Pedidos",
      value: orderCount,
      format: "number" as const,
      icon: "shopping-cart",
      accent: "blue" as const,
      href: "/admin/pedidos",
    },
    {
      label: "Ingresos",
      value: revenue,
      format: "currency" as const,
      icon: "dollar-sign",
      accent: "green" as const,
    },
    {
      label: "Ventas pagadas",
      value: paidOrders.length,
      format: "number" as const,
      icon: "trending-up",
      accent: "amber" as const,
    },
  ];

  return (
    <div className="pb-2">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Dashboard"
          description={`Resumen de tu tienda ${storeDisplayName}.`}
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1} className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <AdminStatCard key={stat.label} {...stat} delay={index * 80} />
        ))}
      </AdminDashboardReveal>

      <AdminDashboardReveal
        index={2}
        className="mb-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]"
      >
        <AdminCard
          title="Actividad de ventas"
          description={periodLabels.description}
          className="overflow-visible"
          action={
            <Suspense fallback={<AdminSkeletonTabs />}>
              <AdminActivityPeriodTabs period={period} />
            </Suspense>
          }>
          <AdminActivityChart
            period={analytics.salesActivity.period}
            data={analytics.salesActivity.points}
            totalOrders={analytics.salesActivity.totalOrders}
            totalRevenue={analytics.salesActivity.totalRevenue}
          />
        </AdminCard>

        <AdminCard
          title="Productos más vendidos"
          description="Ranking por unidades vendidas (histórico)">
          <AdminTopProducts products={analytics.topProducts} />
        </AdminCard>
      </AdminDashboardReveal>

      <AdminDashboardReveal index={3}>
        <AdminCard title="Pedidos recientes" padding={false}>
          <AdminDataTable
            columns={["Cliente", "Estado", "Total", "Fecha"]}
          >
            {recentOrders.length === 0 ? (
              <AdminTableEmpty colSpan={4}>No hay pedidos aún</AdminTableEmpty>
            ) : (
              recentOrders.map((order) => (
                <AdminTableRow key={order.id}>
                  <AdminTableCell className="font-medium text-neutral-900">
                    {order.customerName}
                  </AdminTableCell>
                  <AdminTableCell>
                    <Badge variant={getOrderStatusVariant(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </AdminTableCell>
                  <AdminTableCell className="font-medium">
                    {formatPrice(Number(order.total))}
                  </AdminTableCell>
                  <AdminTableCell className="text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString("es-AR")}
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminDataTable>
        </AdminCard>
      </AdminDashboardReveal>
    </div>
  );
}
