import { AdminCard } from "@/components/admin/admin-card";
import type { AnalyticsCategoryRank } from "@/lib/advanced-analytics";
import { formatPrice } from "@/lib/utils";

type AdminAnalyticsTopCategoriesProps = {
  categories: AnalyticsCategoryRank[];
};

export function AdminAnalyticsTopCategories({
  categories,
}: AdminAnalyticsTopCategoriesProps) {
  return (
    <AdminCard
      title="Top categorías"
      description="Unidades e ingresos por categoría de producto."
    >
      {categories.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Sin ventas categorizadas en este período.
        </p>
      ) : (
        <ol className="divide-y divide-neutral-100">
          {categories.map((category, index) => (
            <li
              key={category.category}
              className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">
                  <span className="mr-2 text-neutral-400">{index + 1}.</span>
                  {category.category}
                </p>
                <p className="text-xs text-neutral-500">
                  {category.quantity} u.
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">
                {formatPrice(category.revenue)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </AdminCard>
  );
}
