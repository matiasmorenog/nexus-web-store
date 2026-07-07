"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminDataTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/admin/admin-table";
import { AdminEmptyState } from "@/components/admin/admin-surface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCouponTypeLabel,
  formatCouponValue,
  type CouponListItem,
} from "@/lib/coupons";
import { formatPrice } from "@/lib/utils";

type AdminCouponsListProps = {
  coupons: CouponListItem[];
};

function formatUsage(coupon: CouponListItem) {
  if (coupon.usageLimit == null) {
    return `${coupon.usedCount} usos`;
  }
  return `${coupon.usedCount} / ${coupon.usageLimit}`;
}

function formatValidity(coupon: CouponListItem) {
  if (!coupon.startsAt && !coupon.expiresAt) {
    return "Sin vencimiento";
  }

  const formatter = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  if (coupon.startsAt && coupon.expiresAt) {
    return `${formatter.format(new Date(coupon.startsAt))} → ${formatter.format(new Date(coupon.expiresAt))}`;
  }

  if (coupon.startsAt) {
    return `Desde ${formatter.format(new Date(coupon.startsAt))}`;
  }

  return `Hasta ${formatter.format(new Date(coupon.expiresAt!))}`;
}

export function AdminCouponsList({ coupons }: AdminCouponsListProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAction = async (couponId: string, formData: FormData) => {
    setPendingId(couponId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "PATCH",
        body: formData,
        credentials: "same-origin",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo actualizar el cupón.");
      }

      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "No se pudo actualizar el cupón.",
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleToggle = async (couponId: string) => {
    const formData = new FormData();
    formData.set("active", "toggle");
    await runAction(couponId, formData);
  };

  const handleDelete = async (couponId: string) => {
    if (!window.confirm("¿Eliminar este cupón?")) return;

    setPendingId(couponId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo eliminar el cupón.");
      }

      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "No se pudo eliminar el cupón.",
      );
    } finally {
      setPendingId(null);
    }
  };

  if (coupons.length === 0) {
    return (
      <AdminCard title="Cupones activos">
        <AdminEmptyState>
          <p className="font-medium text-neutral-900">Todavía no hay cupones</p>
          <p className="mt-1 text-sm text-neutral-500">
            Creá el primero para ofrecer descuentos en el checkout.
          </p>
        </AdminEmptyState>
      </AdminCard>
    );
  }

  return (
    <AdminCard title="Cupones activos" padding={false}>
      {error ? (
        <p className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <AdminDataTable
        columns={[
          "Código",
          "Beneficio",
          "Mínimo",
          "Usos",
          "Vigencia",
          "Estado",
          { label: "Acciones", align: "right" },
        ]}
      >
        {coupons.map((coupon) => (
            <AdminTableRow key={coupon.id}>
              <AdminTableCell className="font-mono font-semibold">
                {coupon.code}
              </AdminTableCell>
              <AdminTableCell>
                <p>{formatCouponValue(coupon.type, coupon.value)}</p>
                <p className="text-xs text-neutral-500">
                  {formatCouponTypeLabel(coupon.type)}
                </p>
              </AdminTableCell>
              <AdminTableCell>
                {coupon.minOrderAmount > 0
                  ? formatPrice(coupon.minOrderAmount)
                  : "—"}
              </AdminTableCell>
              <AdminTableCell>{formatUsage(coupon)}</AdminTableCell>
              <AdminTableCell className="max-w-[220px] text-sm text-neutral-600">
                {formatValidity(coupon)}
              </AdminTableCell>
              <AdminTableCell>
                <Badge variant={coupon.active ? "success" : "warning"}>
                  {coupon.active ? "Activo" : "Pausado"}
                </Badge>
              </AdminTableCell>
              <AdminTableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pendingId === coupon.id}
                    onClick={() => handleToggle(coupon.id)}
                  >
                    {coupon.active ? "Pausar" : "Activar"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    disabled={pendingId === coupon.id}
                    onClick={() => handleDelete(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
      </AdminDataTable>
    </AdminCard>
  );
}
