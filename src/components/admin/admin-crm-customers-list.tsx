import Link from "next/link";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/admin/admin-table";
import { AdminEmptyState } from "@/components/admin/admin-surface";
import { Badge } from "@/components/ui/badge";
import {
  buildCrmCustomerHref,
  type CrmCustomerListItem,
} from "@/lib/crm";
import { formatPrice } from "@/lib/utils";

type AdminCrmCustomersListProps = {
  customers: CrmCustomerListItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminCrmCustomersList({ customers }: AdminCrmCustomersListProps) {
  if (customers.length === 0) {
    return (
      <AdminEmptyState>
        <p className="font-medium text-neutral-900">Sin clientes</p>
        <p className="mt-1 text-sm text-neutral-500">
          Los clientes aparecen acá cuando registran al menos un pedido en la tienda.
        </p>
      </AdminEmptyState>
    );
  }

  return (
    <AdminCard padding={false} title="Clientes" description="Ordenados por última compra.">
      <AdminDataTable
        columns={[
          "Cliente",
          "Contacto",
          "Pedidos",
          "Total",
          "Última compra",
          "Tags",
        ]}
      >
        {customers.map((customer) => (
          <AdminTableRow key={customer.email}>
            <AdminTableCell>
              <Link
                href={buildCrmCustomerHref(customer.email)}
                className="font-medium text-neutral-900 hover:underline"
              >
                {customer.name}
              </Link>
              <p className="mt-0.5 text-xs text-neutral-500">{customer.email}</p>
            </AdminTableCell>
            <AdminTableCell className="text-sm text-neutral-600">
              {customer.phone}
            </AdminTableCell>
            <AdminTableCell className="tabular-nums">
              {customer.orderCount}
            </AdminTableCell>
            <AdminTableCell className="font-medium tabular-nums">
              {formatPrice(customer.totalSpent)}
            </AdminTableCell>
            <AdminTableCell className="text-sm text-neutral-600">
              {formatDate(customer.lastOrderAt)}
            </AdminTableCell>
            <AdminTableCell>
              {customer.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {customer.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-neutral-400">—</span>
              )}
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminDataTable>
    </AdminCard>
  );
}
