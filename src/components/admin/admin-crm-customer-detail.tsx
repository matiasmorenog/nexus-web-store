import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminCrmCustomerProfileForm } from "@/components/admin/admin-crm-customer-profile-form";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
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

function daysSince(value: string | null): number | null {
  if (!value) return null;
  const ms = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(ms) || ms < 0) return 0;
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function Metric({
  label,
  children,
  emphasize = false,
}: {
  label: string;
  children: React.ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <div
        className={
          emphasize
            ? "mt-1 text-2xl font-bold tracking-tight tabular-nums text-neutral-900 sm:text-3xl"
            : "mt-1 text-lg font-semibold tabular-nums text-neutral-900"
        }
      >
        {children}
      </div>
    </div>
  );
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

  const averageTicket =
    customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0;
  const inactiveDays = daysSince(customer.lastOrderAt);

  return (
    <div className="space-y-6">
      <div className="grid items-stretch gap-4 xl:grid-cols-2">
        <AdminCard
          className="h-full"
          title="Ficha"
          description="Resumen comercial del cliente."
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
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Metric label="Total comprado" emphasize>
                {formatPrice(customer.totalSpent)}
              </Metric>
              <Metric label="Ticket promedio" emphasize>
                {formatPrice(averageTicket)}
              </Metric>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Metric label="Pedidos">{customer.orderCount}</Metric>
              <Metric label="Sin comprar">
                {inactiveDays == null
                  ? "—"
                  : inactiveDays === 0
                    ? "Hoy"
                    : `${inactiveDays}d`}
              </Metric>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Teléfono
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-neutral-800">
                    {customer.phone}
                  </span>
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
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Primera compra
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {formatDate(customer.firstOrderAt)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Última compra
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {formatDate(customer.lastOrderAt)}
                </p>
              </div>
            </div>
          </div>
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
