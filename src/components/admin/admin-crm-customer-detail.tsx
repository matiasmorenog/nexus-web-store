import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminCrmCustomerProfileForm } from "@/components/admin/admin-crm-customer-profile-form";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import {
  AdminCardSection,
  AdminDetailField,
  AdminDetailGrid,
} from "@/components/admin/admin-surface";
import { buildAdminOrderHref } from "@/lib/admin-analytics-shared";
import type { CrmCustomerDetail } from "@/lib/crm";
import { formatPrice } from "@/lib/utils";

type AdminCrmCustomerDetailProps = {
  customer: CrmCustomerDetail;
  readOnly?: boolean;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminCrmCustomerDetail({
  customer,
  readOnly = false,
}: AdminCrmCustomerDetailProps) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/modulos/crm"
          className="-ml-2 mb-4 inline-flex h-8 items-center rounded-[var(--ui-button-radius,0.5rem)] border border-neutral-300 bg-white px-3 text-sm text-neutral-900 hover:border-neutral-400 hover:bg-neutral-50"
        >
          <ArrowLeft className="mr-2 size-4" />
          Volver a clientes
        </Link>

        <AdminCard
          title={customer.name}
          description={customer.email}
          action={
            customer.profile.tags.length > 0 ? (
              <div className="flex flex-wrap justify-end gap-1">
                {customer.profile.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            ) : null
          }
        >
          <AdminCardSection>
            <AdminDetailGrid>
              <AdminDetailField label="Teléfono">
                {customer.phone}
              </AdminDetailField>
              <AdminDetailField label="Pedidos">
                {customer.orderCount}
              </AdminDetailField>
              <AdminDetailField label="Total comprado">
                {formatPrice(customer.totalSpent)}
              </AdminDetailField>
              <AdminDetailField label="Primera compra">
                {formatDate(customer.firstOrderAt)}
              </AdminDetailField>
              <AdminDetailField label="Última compra">
                {formatDate(customer.lastOrderAt)}
              </AdminDetailField>
            </AdminDetailGrid>
          </AdminCardSection>
        </AdminCard>
      </div>

      <AdminCrmCustomerProfileForm
        email={customer.email}
        profile={customer.profile}
        readOnly={readOnly}
      />

      <AdminCard
        padding={false}
        title="Historial de pedidos"
        description="Pedidos asociados a este email."
      >
        <AdminDataTable columns={["Pedido", "Fecha", "Estado", "Total", ""]}>
          {customer.orders.map((order) => (
            <AdminTableRow key={order.id}>
              <AdminTableCell className="font-mono text-sm">
                #{order.id.slice(-8)}
              </AdminTableCell>
              <AdminTableCell className="text-sm text-neutral-600">
                {formatDate(order.createdAt)}
              </AdminTableCell>
              <AdminTableCell>
                <Badge>{order.status}</Badge>
              </AdminTableCell>
              <AdminTableCell className="font-medium tabular-nums">
                {formatPrice(order.total)}
              </AdminTableCell>
              <AdminTableCell className="text-right">
                <Link
                  href={buildAdminOrderHref(order.id)}
                  className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
                >
                  Ver pedido
                </Link>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminDataTable>
      </AdminCard>
    </div>
  );
}
