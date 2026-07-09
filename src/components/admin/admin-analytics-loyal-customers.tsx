import Link from "next/link";
import { AdminCard } from "@/components/admin/admin-card";
import type { AnalyticsLoyalCustomer } from "@/lib/advanced-analytics";
import { buildCrmCustomerHref } from "@/lib/crm";
import { storeHasModule } from "@/lib/modules/access";
import { formatPrice } from "@/lib/utils";

type AdminAnalyticsLoyalCustomersProps = {
  storeId: string;
  customers: AnalyticsLoyalCustomer[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export async function AdminAnalyticsLoyalCustomers({
  storeId,
  customers,
}: AdminAnalyticsLoyalCustomersProps) {
  const crmEnabled = await storeHasModule(storeId, "crm");

  return (
    <AdminCard
      title="Clientes más fieles"
      description="Quienes más pedidos pagados hicieron en el período (útil para contacto o beneficios)."
    >
      {customers.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Sin clientes con pedidos pagados en este período.
        </p>
      ) : (
        <ol className="divide-y divide-neutral-100">
          {customers.map((customer, index) => {
            const nameNode = crmEnabled ? (
              <Link
                href={buildCrmCustomerHref(customer.email)}
                className="truncate font-medium text-neutral-900 hover:underline"
              >
                {customer.name}
              </Link>
            ) : (
              <span className="truncate font-medium text-neutral-900">
                {customer.name}
              </span>
            );

            return (
              <li
                key={customer.email}
                className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="flex min-w-0 items-baseline gap-2 text-sm">
                    <span className="shrink-0 text-neutral-400">
                      {index + 1}.
                    </span>
                    {nameNode}
                  </p>
                  <p className="mt-0.5 truncate pl-5 text-xs text-neutral-500">
                    {customer.email}
                  </p>
                  <p className="mt-0.5 pl-5 text-xs text-neutral-500">
                    {customer.orderCount}{" "}
                    {customer.orderCount === 1 ? "pedido" : "pedidos"} · última{" "}
                    {formatDate(customer.lastOrderAt)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">
                  {formatPrice(customer.revenue)}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </AdminCard>
  );
}
