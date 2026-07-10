import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableRow,
} from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { buildAdminOrderHref, type DashboardRecentOrder } from "@/lib/admin-analytics-shared";
import { formatPrice } from "@/lib/utils";
import { getOrderStatusLabel, getOrderStatusVariant } from "@/lib/order-status";

export function AdminDashboardRecentOrders({
  orders,
}: {
  orders: DashboardRecentOrder[];
}) {
  return (
    <AdminDataTable columns={["Cliente", "Estado", "Total", "Fecha", ""]}>
      {orders.length === 0 ? (
        <AdminTableEmpty colSpan={5}>No hay pedidos aún</AdminTableEmpty>
      ) : (
        orders.map((order) => {
          const href = buildAdminOrderHref(order.id, order.createdAt);

          return (
            <AdminTableRow key={order.id} className="relative">
              <AdminTableCell className="font-medium text-neutral-900">
                <Link
                  href={href}
                  className="after:absolute after:inset-0 after:content-['']"
                >
                  {order.customerName}
                </Link>
              </AdminTableCell>
              <AdminTableCell>
                <Badge variant={getOrderStatusVariant(order.status)}>
                  {getOrderStatusLabel(order.status)}
                </Badge>
              </AdminTableCell>
              <AdminTableCell className="font-medium">
                {formatPrice(order.total)}
              </AdminTableCell>
              <AdminTableCell className="text-neutral-500">
                {new Date(order.createdAt).toLocaleDateString("es-AR")}
              </AdminTableCell>
              <AdminTableCell className="w-10 text-neutral-400">
                <ChevronRight className="size-4" aria-hidden />
              </AdminTableCell>
            </AdminTableRow>
          );
        })
      )}
    </AdminDataTable>
  );
}
