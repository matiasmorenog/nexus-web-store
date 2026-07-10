import Link from "next/link";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/admin/admin-table";
import { AdminEmptyState } from "@/components/admin/admin-surface";
import type { WishlistAdminInsights } from "@/lib/wishlist";

type AdminWishlistInsightsProps = {
  insights: WishlistAdminInsights;
};

export function AdminWishlistInsights({ insights }: AdminWishlistInsightsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminCard title="Guardados totales" description="Ítems en wishlists de clientes.">
          <p className="text-3xl font-bold tracking-tight text-neutral-900">
            {insights.totalItems}
          </p>
        </AdminCard>
        <AdminCard title="Clientes con favoritos" description="Usuarios con al menos un ítem.">
          <p className="text-3xl font-bold tracking-tight text-neutral-900">
            {insights.uniqueCustomers}
          </p>
        </AdminCard>
      </div>

      <AdminCard
        padding={false}
        title="Productos más deseados"
        description="Ranking por cantidad de clientes que los guardaron."
      >
        {insights.topProducts.length === 0 ? (
          <AdminEmptyState>
            Todavía no hay productos en wishlists de clientes registrados.
          </AdminEmptyState>
        ) : (
          <AdminDataTable columns={["Producto", "Guardados", ""]}>
            {insights.topProducts.map((product) => (
              <AdminTableRow key={product.productId}>
                <AdminTableCell>
                  <p className="font-medium text-neutral-900">{product.productName}</p>
                  <p className="text-xs text-neutral-500">/{product.productSlug}</p>
                </AdminTableCell>
                <AdminTableCell className="tabular-nums">
                  {product.wishlistCount}
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <Link
                    href={`/producto/${product.productSlug}`}
                    target="_blank"
                    className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
                  >
                    Ver en tienda
                  </Link>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminDataTable>
        )}
      </AdminCard>
    </div>
  );
}
