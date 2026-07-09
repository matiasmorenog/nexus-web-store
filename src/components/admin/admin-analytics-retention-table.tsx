import { AdminCard } from "@/components/admin/admin-card";
import type { AnalyticsRetentionWeek } from "@/lib/advanced-analytics";
import { cn } from "@/lib/utils";

type AdminAnalyticsRetentionTableProps = {
  retention: AnalyticsRetentionWeek[];
};

const WEEK_LABELS = ["W0", "W1", "W2", "W3", "W4", "W5"] as const;

function formatRate(value: number | null): string {
  if (value == null) return "—";
  return `${Math.round(value * 10) / 10}%`;
}

function formatCohortWeek(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

function cellTone(value: number | null): string {
  if (value == null) return "bg-transparent text-neutral-400";
  if (value >= 60) return "bg-emerald-100 text-emerald-900";
  if (value >= 30) return "bg-amber-50 text-amber-900";
  if (value > 0) return "bg-neutral-100 text-neutral-700";
  return "bg-neutral-50 text-neutral-500";
}

export function AdminAnalyticsRetentionTable({
  retention,
}: AdminAnalyticsRetentionTableProps) {
  return (
    <AdminCard
      title="Retention semanal"
      description="Cohortes por semana de primera compra pagada. W0 = semana de alta."
    >
      {retention.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay cohortes con pedidos pagados en este período.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-2 py-2 font-medium">Cohorte</th>
                <th className="px-2 py-2 font-medium">Clientes</th>
                {WEEK_LABELS.map((label) => (
                  <th key={label} className="px-2 py-2 text-center font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {retention.map((row) => (
                <tr
                  key={row.cohortWeek}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <td className="px-2 py-2 font-medium text-neutral-900">
                    {formatCohortWeek(row.cohortWeek)}
                  </td>
                  <td className="px-2 py-2 tabular-nums text-neutral-700">
                    {row.cohortSize}
                  </td>
                  {row.weeks.map((value, index) => (
                    <td key={WEEK_LABELS[index]} className="px-1 py-1.5">
                      <span
                        className={cn(
                          "flex min-h-8 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums",
                          cellTone(value),
                        )}
                      >
                        {formatRate(value)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminCard>
  );
}
