import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
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
import {
  buildWhatsAppUrl,
  isValidWhatsAppPhone,
} from "@/lib/marketing/format";
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
  const whatsappReady =
    customer.phone !== "—" && isValidWhatsAppPhone(customer.phone);
  const whatsappHref = whatsappReady
    ? buildWhatsAppUrl(
        customer.phone,
        `Hola ${customer.name.split(" ")[0] || ""}, te escribimos de la tienda.`,
      )
    : null;

  return (
    <div className="space-y-6">
      <AdminBreadcrumb
        items={[
          { label: "CRM", href: "/admin/modulos/crm" },
          { label: customer.name },
        ]}
      />

      <div className="grid items-stretch gap-4 xl:grid-cols-2">
        <AdminCard
          className="h-full"
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
          <AdminCardSection bordered={false} className="!px-0 !py-0">
            <AdminDetailGrid className="gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AdminDetailField label="Teléfono">
                <span className="inline-flex flex-wrap items-center gap-2">
                  <span>{customer.phone}</span>
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 text-xs font-medium text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100"
                    >
                      <MessageCircle className="size-3.5" />
                      WhatsApp
                    </a>
                  ) : null}
                </span>
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

        <AdminCrmCustomerProfileForm
          email={customer.email}
          profile={customer.profile}
          readOnly={readOnly}
          compact
        />
      </div>

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
